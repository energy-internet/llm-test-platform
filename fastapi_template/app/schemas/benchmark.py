# app/schemas/benchmark.py
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID

class BenchmarkBase(BaseModel):
    name: str
    description: Optional[str] = None
    benchmark_type: str
    config: Optional[Dict[str, Any]] = None

class BenchmarkCreate(BenchmarkBase):
    pass

class BenchmarkUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

class BenchmarkInDB(BenchmarkBase):
    id: UUID
    file_path: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Benchmark(BenchmarkInDB):
    pass

class BenchmarkUpload(BaseModel):
    name: str
    description: Optional[str] = None
    benchmark_type: str = "custom"
    config: Optional[Dict[str, Any]] = None