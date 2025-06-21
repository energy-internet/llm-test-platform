# app/api/api_v1/endpoints/tests.py
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.api.api_v1.endpoints.auth import get_current_user
from app.schemas.test_task import TestTask, TestTaskCreate, TestTaskUpdate, TaskStatusUpdate
from app.schemas.test_result import TestResult
from app.services.test_service import TestService
from app.models.user import User as UserModel
from app.tasks.test_tasks import execute_model_test
import uuid

router = APIRouter()

@router.post("", response_model=TestTask)
def create_test_task(
    task_data: TestTaskCreate,
    background_tasks: BackgroundTasks,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new test task"""
    task = TestService.create_test_task(db, current_user.id, task_data)
    
    # Queue the test execution task
    background_tasks.add_task(execute_model_test.delay, str(task.id))
    
    return task

@router.get("", response_model=List[TestTask])
def get_test_tasks(
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = None,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's test tasks"""
    tasks = TestService.get_user_tasks(db, current_user.id, skip, limit)
    
    if status:
        tasks = [task for task in tasks if task.status == status]
    
    return tasks

@router.get("/{task_id}", response_model=TestTask)
def get_test_task(
    task_id: str,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific test task"""
    task = TestService.get_task_by_id(db, uuid.UUID(task_id), current_user.id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.get("/{task_id}/status")
def get_task_status(
    task_id: str,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get task status and progress"""
    task = TestService.get_task_by_id(db, uuid.UUID(task_id), current_user.id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return {
        "task_id": task_id,
        "status": task.status,
        "progress": float(task.progress),
        "error_message": task.error_message,
        "created_at": task.created_at,
        "started_at": task.started_at,
        "completed_at": task.completed_at
    }

@router.get("/{task_id}/results", response_model=List[TestResult])
def get_task_results(
    task_id: str,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get test results for a task"""
    return TestService.get_task_results(db, uuid.UUID(task_id), current_user.id)

@router.post("/{task_id}/cancel")
def cancel_test_task(
    task_id: str,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancel a test task"""
    success = TestService.cancel_task(db, uuid.UUID(task_id), current_user.id)
    if not success:
        raise HTTPException(status_code=400, detail="Cannot cancel task")
    return {"message": "Task cancelled successfully"}

@router.post("/{task_id}/retry")
def retry_test_task(
    task_id: str,
    background_tasks: BackgroundTasks,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retry a failed test task"""
    success = TestService.retry_task(db, uuid.UUID(task_id), current_user.id)
    if not success:
        raise HTTPException(status_code=400, detail="Cannot retry task")
    
    # Queue the test execution task again
    background_tasks.add_task(execute_model_test.delay, task_id)
    
    return {"message": "Task queued for retry"}

@router.put("/{task_id}/status")
def update_task_status(
    task_id: str,
    status_update: TaskStatusUpdate,
    db: Session = Depends(get_db)
):
    """Update task status (internal use)"""
    task = TestService.update_task_status(db, uuid.UUID(task_id), status_update)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.get("/queue/statistics")
def get_queue_statistics(
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get task queue statistics"""
    return TestService.get_task_statistics(db, current_user.id)