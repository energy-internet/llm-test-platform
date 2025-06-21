# app/api/api_v1/endpoints/models.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.api.api_v1.endpoints.auth import get_current_user
from app.schemas.model_provider import (
    ModelProvider, ModelProviderCreate, ModelProviderUpdate, ModelTestRequest, AIModel
)
from app.services.model_service import ModelService
from app.models.user import User as UserModel

router = APIRouter()
model_service = ModelService()

@router.get("/providers", response_model=List[ModelProvider])
def get_model_providers(
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all model providers for current user"""
    return model_service.get_user_providers(db, current_user.id)

@router.post("/providers", response_model=ModelProvider)
def create_model_provider(
    provider_data: ModelProviderCreate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new model provider"""
    return model_service.create_model_provider(db, current_user.id, provider_data)

@router.get("/providers/{provider_id}", response_model=ModelProvider)
def get_model_provider(
    provider_id: str,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific model provider"""
    provider = model_service.get_provider_by_id(db, provider_id, current_user.id)
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    return provider

@router.put("/providers/{provider_id}", response_model=ModelProvider)
def update_model_provider(
    provider_id: str,
    update_data: ModelProviderUpdate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a model provider"""
    provider = model_service.update_provider(db, provider_id, current_user.id, update_data)
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    return provider

@router.delete("/providers/{provider_id}")
def delete_model_provider(
    provider_id: str,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a model provider"""
    success = model_service.delete_provider(db, provider_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Provider not found")
    return {"message": "Provider deleted successfully"}

@router.post("/providers/{provider_id}/test")
def test_model_provider(
    provider_id: str,
    test_request: ModelTestRequest,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Test connection to a model provider"""
    return model_service.test_provider_connection(db, provider_id, current_user.id, test_request)

@router.get("", response_model=List[AIModel])
def get_available_models(
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all available AI models for current user"""
    return model_service.get_available_models(db, current_user.id)

@router.get("/{model_id}", response_model=AIModel)
def get_model_details(
    model_id: str,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get details of a specific AI model"""
    from app.models.model_provider import AIModel as AIModelDB
    model = db.query(AIModelDB).join(AIModelDB.provider).filter(
        AIModelDB.id == model_id,
        AIModelDB.provider.has(user_id=current_user.id)
    ).first()
    
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    return model