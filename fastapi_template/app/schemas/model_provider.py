# app/schemas/model_provider.py
from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID

class ModelProviderBase(BaseModel):
    name: str
    provider_type: str
    api_endpoint: Optional[str] = None
    config: Optional[Dict[str, Any]] = None

class ModelProviderCreate(ModelProviderBase):
    api_key: str

class ModelProviderUpdate(BaseModel):
    name: Optional[str] = None
    api_endpoint: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    api_key: Optional[str] = None
    is_active: Optional[bool] = None

class ModelProviderInDB(ModelProviderBase):
    id: UUID
    user_id: UUID
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ModelProvider(ModelProviderInDB):
    pass

class AIModelBase(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    
    name: str
    model_type: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None
    model_metadata: Optional[Dict[str, Any]] = None

class AIModel(AIModelBase):
    id: UUID
    provider_id: UUID
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ModelTestRequest(BaseModel):
    provider_id: UUID
    test_message: str = "Hello, this is a test message."