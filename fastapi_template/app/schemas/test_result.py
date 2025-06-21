# app/schemas/test_result.py
from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID

class TestResultBase(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    
    task_id: UUID
    model_id: UUID
    test_case_id: Optional[str] = None
    input_data: Optional[Dict[str, Any]] = None
    output_data: Optional[Dict[str, Any]] = None
    score: Optional[float] = None
    metrics: Optional[Dict[str, Any]] = None
    execution_time: Optional[float] = None

class TestResultCreate(TestResultBase):
    pass

class TestResultInDB(TestResultBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class TestResult(TestResultInDB):
    pass