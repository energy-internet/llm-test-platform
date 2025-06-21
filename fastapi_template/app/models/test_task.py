# app/models/test_task.py
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, Numeric, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
import enum
from app.core.database import Base

class TaskStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class TestTask(Base):
    __tablename__ = "test_tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name = Column(String(200), nullable=False)
    benchmark_id = Column(UUID(as_uuid=True), ForeignKey("benchmarks.id"), nullable=False)
    model_ids = Column(ARRAY(UUID(as_uuid=True)))
    config = Column(JSONB)
    status = Column(Enum(TaskStatus), default=TaskStatus.PENDING)
    progress = Column(Numeric(5, 2), default=0)
    error_message = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    
    # Relationships
    user = relationship("User", back_populates="test_tasks")
    benchmark = relationship("Benchmark", back_populates="test_tasks")
    test_results = relationship("TestResult", back_populates="task")
    reports = relationship("Report", back_populates="task")