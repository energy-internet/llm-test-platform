# app/models/test_result.py
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.core.database import Base

class TestResult(Base):
    __tablename__ = "test_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    task_id = Column(UUID(as_uuid=True), ForeignKey("test_tasks.id"), nullable=False)
    model_id = Column(UUID(as_uuid=True), ForeignKey("ai_models.id"), nullable=False)
    test_case_id = Column(String(100))
    input_data = Column(JSONB)
    output_data = Column(JSONB)
    score = Column(Numeric(10, 4))
    metrics = Column(JSONB)
    execution_time = Column(Numeric(10, 3))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    task = relationship("TestTask", back_populates="test_results")
    model = relationship("AIModel", back_populates="test_results")