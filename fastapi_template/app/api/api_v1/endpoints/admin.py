# app/api/api_v1/endpoints/admin.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any, List
from app.core.database import get_db
from app.api.api_v1.endpoints.auth import get_current_user
from app.models.user import User as UserModel, UserRole
from app.models.test_task import TestTask, TaskStatus
from app.models.model_provider import ModelProvider
from app.models.benchmark import Benchmark
from app.services.test_service import TestService

router = APIRouter()

def get_admin_user(current_user: UserModel = Depends(get_current_user)) -> UserModel:
    """Verify user has admin role"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

@router.get("/stats")
def get_system_statistics(
    admin_user: UserModel = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive system statistics"""
    
    # User statistics
    total_users = db.query(UserModel).count()
    active_users = db.query(UserModel).filter(UserModel.is_active == True).count()
    
    # Model provider statistics
    total_providers = db.query(ModelProvider).count()
    active_providers = db.query(ModelProvider).filter(ModelProvider.is_active == True).count()
    
    provider_types = db.query(
        ModelProvider.provider_type,
        func.count(ModelProvider.id).label('count')
    ).group_by(ModelProvider.provider_type).all()
    
    # Task statistics
    total_tasks = db.query(TestTask).count()
    task_status_counts = db.query(
        TestTask.status,
        func.count(TestTask.id).label('count')
    ).group_by(TestTask.status).all()
    
    # Benchmark statistics
    total_benchmarks = db.query(Benchmark).count()
    benchmark_types = db.query(
        Benchmark.benchmark_type,
        func.count(Benchmark.id).label('count')
    ).group_by(Benchmark.benchmark_type).all()
    
    # Recent activity
    recent_tasks = db.query(TestTask).order_by(
        TestTask.created_at.desc()
    ).limit(10).all()
    
    return {
        "users": {
            "total": total_users,
            "active": active_users,
            "inactive": total_users - active_users
        },
        "providers": {
            "total": total_providers,
            "active": active_providers,
            "by_type": {pt.provider_type: pt.count for pt in provider_types}
        },
        "tasks": {
            "total": total_tasks,
            "by_status": {status.status: status.count for status in task_status_counts}
        },
        "benchmarks": {
            "total": total_benchmarks,
            "by_type": {bt.benchmark_type: bt.count for bt in benchmark_types}
        },
        "recent_activity": [
            {
                "task_id": str(task.id),
                "name": task.name,
                "status": task.status,
                "created_at": task.created_at,
                "user_id": str(task.user_id)
            }
            for task in recent_tasks
        ]
    }

@router.get("/users")
def get_all_users(
    skip: int = 0,
    limit: int = 50,
    admin_user: UserModel = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get all users (admin only)"""
    users = db.query(UserModel).offset(skip).limit(limit).all()
    
    return [
        {
            "id": str(user.id),
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active,
            "created_at": user.created_at,
            "provider_count": len(user.model_providers),
            "task_count": len(user.test_tasks)
        }
        for user in users
    ]

@router.get("/tasks")
def get_all_tasks(
    status: str = None,
    skip: int = 0,
    limit: int = 50,
    admin_user: UserModel = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get all tasks with filtering (admin only)"""
    query = db.query(TestTask)
    
    if status:
        query = query.filter(TestTask.status == status)
    
    tasks = query.order_by(TestTask.created_at.desc()).offset(skip).limit(limit).all()
    
    return [
        {
            "id": str(task.id),
            "name": task.name,
            "status": task.status,
            "progress": float(task.progress),
            "created_at": task.created_at,
            "started_at": task.started_at,
            "completed_at": task.completed_at,
            "user_id": str(task.user_id),
            "model_count": len(task.model_ids) if task.model_ids else 0
        }
        for task in tasks
    ]

@router.get("/system-health")
def get_system_health(
    admin_user: UserModel = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get system health status"""
    
    # Check database connectivity
    try:
        db.execute("SELECT 1")
        db_status = "healthy"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    # Check running tasks
    running_tasks = TestService.get_running_tasks(db)
    
    # Check for stuck tasks (running for more than 1 hour)
    from datetime import datetime, timedelta
    stuck_tasks = [
        task for task in running_tasks 
        if task.started_at and (datetime.utcnow() - task.started_at) > timedelta(hours=1)
    ]
    
    return {
        "database": db_status,
        "running_tasks": len(running_tasks),
        "stuck_tasks": len(stuck_tasks),
        "system_load": {
            "pending_tasks": len([t for t in running_tasks if t.status == TaskStatus.PENDING]),
            "active_tasks": len([t for t in running_tasks if t.status == TaskStatus.RUNNING])
        },
        "alerts": [
            f"Found {len(stuck_tasks)} stuck tasks"
        ] if stuck_tasks else []
    }

@router.post("/tasks/{task_id}/force-cancel")
def force_cancel_task(
    task_id: str,
    admin_user: UserModel = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Force cancel a task (admin only)"""
    from app.schemas.test_task import TaskStatusUpdate
    
    task = TestService.update_task_status(
        db, 
        task_id, 
        TaskStatusUpdate(status=TaskStatus.CANCELLED, error_message="Cancelled by admin")
    )
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return {"message": f"Task {task_id} has been force cancelled"}