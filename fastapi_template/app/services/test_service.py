# app/services/test_service.py
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.test_task import TestTask, TaskStatus
from app.models.test_result import TestResult
from app.models.benchmark import Benchmark
from app.models.model_provider import AIModel
from app.schemas.test_task import TestTaskCreate, TestTaskUpdate, TaskStatusUpdate
from app.schemas.test_result import TestResultCreate
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime

class TestService:
    @staticmethod
    def create_test_task(db: Session, user_id: uuid.UUID, task_data: TestTaskCreate) -> TestTask:
        # Validate benchmark exists
        benchmark = db.query(Benchmark).filter(Benchmark.id == task_data.benchmark_id).first()
        if not benchmark:
            raise HTTPException(status_code=404, detail="Benchmark not found")
        
        # Validate models exist and belong to user
        models = db.query(AIModel).join(AIModel.provider).filter(
            AIModel.id.in_(task_data.model_ids),
            AIModel.provider.has(user_id=user_id)
        ).all()
        
        if len(models) != len(task_data.model_ids):
            raise HTTPException(status_code=400, detail="Some models not found or not accessible")
        
        # Create test task
        db_task = TestTask(
            user_id=user_id,
            name=task_data.name,
            benchmark_id=task_data.benchmark_id,
            model_ids=task_data.model_ids,
            config=task_data.config or {},
            status=TaskStatus.PENDING
        )
        
        db.add(db_task)
        db.commit()
        db.refresh(db_task)
        
        return db_task
    
    @staticmethod
    def get_user_tasks(db: Session, user_id: uuid.UUID, skip: int = 0, limit: int = 50) -> List[TestTask]:
        return db.query(TestTask).filter(
            TestTask.user_id == user_id
        ).order_by(TestTask.created_at.desc()).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_task_by_id(db: Session, task_id: uuid.UUID, user_id: uuid.UUID) -> Optional[TestTask]:
        return db.query(TestTask).filter(
            TestTask.id == task_id,
            TestTask.user_id == user_id
        ).first()
    
    @staticmethod
    def update_task_status(db: Session, task_id: uuid.UUID, status_update: TaskStatusUpdate) -> Optional[TestTask]:
        task = db.query(TestTask).filter(TestTask.id == task_id).first()
        if not task:
            return None
        
        task.status = status_update.status
        if status_update.progress is not None:
            task.progress = status_update.progress
        if status_update.error_message is not None:
            task.error_message = status_update.error_message
        
        if status_update.status == TaskStatus.RUNNING and not task.started_at:
            task.started_at = datetime.utcnow()
        elif status_update.status in [TaskStatus.COMPLETED, TaskStatus.FAILED, TaskStatus.CANCELLED]:
            task.completed_at = datetime.utcnow()
        
        db.commit()
        db.refresh(task)
        return task
    
    @staticmethod
    def cancel_task(db: Session, task_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        task = db.query(TestTask).filter(
            TestTask.id == task_id,
            TestTask.user_id == user_id
        ).first()
        
        if not task or task.status in [TaskStatus.COMPLETED, TaskStatus.FAILED, TaskStatus.CANCELLED]:
            return False
        
        task.status = TaskStatus.CANCELLED
        task.completed_at = datetime.utcnow()
        db.commit()
        return True
    
    @staticmethod
    def retry_task(db: Session, task_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        task = db.query(TestTask).filter(
            TestTask.id == task_id,
            TestTask.user_id == user_id
        ).first()
        
        if not task or task.status not in [TaskStatus.FAILED, TaskStatus.CANCELLED]:
            return False
        
        task.status = TaskStatus.PENDING
        task.progress = 0
        task.error_message = None
        task.started_at = None
        task.completed_at = None
        db.commit()
        return True
    
    @staticmethod
    def get_task_results(db: Session, task_id: uuid.UUID, user_id: uuid.UUID) -> List[TestResult]:
        # Verify task belongs to user
        task = db.query(TestTask).filter(
            TestTask.id == task_id,
            TestTask.user_id == user_id
        ).first()
        
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        return db.query(TestResult).filter(TestResult.task_id == task_id).all()
    
    @staticmethod
    def create_test_result(db: Session, result_data: TestResultCreate) -> TestResult:
        db_result = TestResult(**result_data.dict())
        db.add(db_result)
        db.commit()
        db.refresh(db_result)
        return db_result
    
    @staticmethod
    def get_running_tasks(db: Session) -> List[TestTask]:
        return db.query(TestTask).filter(
            TestTask.status.in_([TaskStatus.PENDING, TaskStatus.RUNNING])
        ).all()
    
    @staticmethod
    def get_task_statistics(db: Session, user_id: uuid.UUID) -> Dict[str, Any]:
        tasks = db.query(TestTask).filter(TestTask.user_id == user_id).all()
        
        stats = {
            "total_tasks": len(tasks),
            "pending": len([t for t in tasks if t.status == TaskStatus.PENDING]),
            "running": len([t for t in tasks if t.status == TaskStatus.RUNNING]),
            "completed": len([t for t in tasks if t.status == TaskStatus.COMPLETED]),
            "failed": len([t for t in tasks if t.status == TaskStatus.FAILED]),
            "cancelled": len([t for t in tasks if t.status == TaskStatus.CANCELLED])
        }
        
        return stats