# app/schemas/test_task.py
from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID
from app.models.test_task import TaskStatus

class TestTaskBase(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    
    name: str
    benchmark_id: UUID
    model_ids: List[UUID]
    config: Optional[Dict[str, Any]] = None

class TestTaskCreate(TestTaskBase):
    pass

class TestTaskUpdate(BaseModel):
    name: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    status: Optional[TaskStatus] = None

class TestTaskInDB(TestTaskBase):
    id: UUID
    user_id: UUID
    status: TaskStatus
    progress: float
    error_message: Optional[str] = None
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class TestTask(TestTaskInDB):
    pass

class TaskStatusUpdate(BaseModel):
    status: TaskStatus
    progress: Optional[float] = None
    error_message: Optional[str] = None