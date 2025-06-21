# app/models/model_provider.py
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.core.database import Base

class ModelProvider(Base):
    __tablename__ = "model_providers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    provider_type = Column(String(50), nullable=False)  # openai, anthropic, google, etc.
    api_endpoint = Column(Text)
    api_key_encrypted = Column(Text)
    config = Column(JSONB)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="model_providers")
    ai_models = relationship("AIModel", back_populates="provider")

class AIModel(Base):
    __tablename__ = "ai_models"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    provider_id = Column(UUID(as_uuid=True), ForeignKey("model_providers.id"), nullable=False)
    name = Column(String(100), nullable=False)
    model_type = Column(String(50))
    parameters = Column(JSONB)
    model_metadata = Column(JSONB)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    provider = relationship("ModelProvider", back_populates="ai_models")
    test_results = relationship("TestResult", back_populates="model")