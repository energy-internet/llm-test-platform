# app/schemas/report.py
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID

class ReportBase(BaseModel):
    title: str
    summary: Optional[Dict[str, Any]] = None
    visualizations: Optional[Dict[str, Any]] = None
    is_public: Optional[bool] = False

class ReportCreate(ReportBase):
    task_id: UUID

class ReportUpdate(BaseModel):
    title: Optional[str] = None
    summary: Optional[Dict[str, Any]] = None
    visualizations: Optional[Dict[str, Any]] = None
    is_public: Optional[bool] = None

class ReportInDB(ReportBase):
    id: UUID
    task_id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class Report(ReportInDB):
    pass

class ReportExport(BaseModel):
    format: str  # csv, json, pdf
    include_raw_data: Optional[bool] = False