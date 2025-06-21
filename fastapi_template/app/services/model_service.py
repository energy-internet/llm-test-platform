# app/services/model_service.py
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.model_provider import ModelProvider, AIModel
from app.schemas.model_provider import ModelProviderCreate, ModelProviderUpdate, ModelTestRequest
from app.core.security import get_password_hash
from cryptography.fernet import Fernet
from app.core.config import settings
import uuid
import openai
import anthropic
import google.generativeai as genai
import requests
from typing import List, Optional, Dict, Any
import json

class ModelService:
    def __init__(self):
        self.cipher_suite = Fernet(settings.SECRET_KEY.encode())
    
    def encrypt_api_key(self, api_key: str) -> str:
        return self.cipher_suite.encrypt(api_key.encode()).decode()
    
    def decrypt_api_key(self, encrypted_key: str) -> str:
        return self.cipher_suite.decrypt(encrypted_key.encode()).decode()
    
    def create_model_provider(self, db: Session, user_id: uuid.UUID, provider_data: ModelProviderCreate) -> ModelProvider:
        encrypted_key = self.encrypt_api_key(provider_data.api_key)
        
        db_provider = ModelProvider(
            user_id=user_id,
            name=provider_data.name,
            provider_type=provider_data.provider_type,
            api_endpoint=provider_data.api_endpoint,
            api_key_encrypted=encrypted_key,
            config=provider_data.config or {}
        )
        
        db.add(db_provider)
        db.commit()
        db.refresh(db_provider)
        
        # Auto-discover and add available models
        self._discover_models(db, db_provider)
        
        return db_provider
    
    def get_user_providers(self, db: Session, user_id: uuid.UUID) -> List[ModelProvider]:
        return db.query(ModelProvider).filter(
            ModelProvider.user_id == user_id,
            ModelProvider.is_active == True
        ).all()
    
    def get_provider_by_id(self, db: Session, provider_id: uuid.UUID, user_id: uuid.UUID) -> Optional[ModelProvider]:
        return db.query(ModelProvider).filter(
            ModelProvider.id == provider_id,
            ModelProvider.user_id == user_id
        ).first()
    
    def update_provider(self, db: Session, provider_id: uuid.UUID, user_id: uuid.UUID, update_data: ModelProviderUpdate) -> Optional[ModelProvider]:
        provider = self.get_provider_by_id(db, provider_id, user_id)
        if not provider:
            return None
        
        update_dict = update_data.dict(exclude_unset=True)
        
        if 'api_key' in update_dict:
            update_dict['api_key_encrypted'] = self.encrypt_api_key(update_dict.pop('api_key'))
        
        for field, value in update_dict.items():
            setattr(provider, field, value)
        
        db.commit()
        db.refresh(provider)
        return provider
    
    def delete_provider(self, db: Session, provider_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        provider = self.get_provider_by_id(db, provider_id, user_id)
        if not provider:
            return False
        
        provider.is_active = False
        db.commit()
        return True
    
    def test_provider_connection(self, db: Session, provider_id: uuid.UUID, user_id: uuid.UUID, test_request: ModelTestRequest) -> Dict[str, Any]:
        provider = self.get_provider_by_id(db, provider_id, user_id)
        if not provider:
            raise HTTPException(status_code=404, detail="Provider not found")
        
        try:
            api_key = self.decrypt_api_key(provider.api_key_encrypted)
            
            if provider.provider_type == "openai":
                return self._test_openai(api_key, test_request.test_message)
            elif provider.provider_type == "anthropic":
                return self._test_anthropic(api_key, test_request.test_message)
            elif provider.provider_type == "google":
                return self._test_google(api_key, test_request.test_message)
            elif provider.provider_type == "ollama":
                return self._test_ollama(provider.api_endpoint, test_request.test_message)
            else:
                raise HTTPException(status_code=400, detail="Unsupported provider type")
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "response_time": None,
                "model_info": None
            }
    
    def _test_openai(self, api_key: str, message: str) -> Dict[str, Any]:
        import time
        start_time = time.time()
        
        client = openai.OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": message}],
            max_tokens=50
        )
        
        response_time = time.time() - start_time
        
        return {
            "success": True,
            "error": None,
            "response_time": response_time,
            "model_info": {
                "model": "gpt-3.5-turbo",
                "response": response.choices[0].message.content
            }
        }
    
    def _test_anthropic(self, api_key: str, message: str) -> Dict[str, Any]:
        import time
        start_time = time.time()
        
        client = anthropic.Anthropic(api_key=api_key)
        response = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=50,
            messages=[{"role": "user", "content": message}]
        )
        
        response_time = time.time() - start_time
        
        return {
            "success": True,
            "error": None,
            "response_time": response_time,
            "model_info": {
                "model": "claude-3-haiku-20240307",
                "response": response.content[0].text
            }
        }
    
    def _test_google(self, api_key: str, message: str) -> Dict[str, Any]:
        import time
        start_time = time.time()
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(message)
        
        response_time = time.time() - start_time
        
        return {
            "success": True,
            "error": None,
            "response_time": response_time,
            "model_info": {
                "model": "gemini-pro",
                "response": response.text
            }
        }
    
    def _test_ollama(self, endpoint: str, message: str) -> Dict[str, Any]:
        import time
        start_time = time.time()
        
        response = requests.post(f"{endpoint}/api/generate", json={
            "model": "llama2",
            "prompt": message,
            "stream": False
        })
        response.raise_for_status()
        
        response_time = time.time() - start_time
        result = response.json()
        
        return {
            "success": True,
            "error": None,
            "response_time": response_time,
            "model_info": {
                "model": "llama2",
                "response": result.get("response", "")
            }
        }
    
    def _discover_models(self, db: Session, provider: ModelProvider):
        """Auto-discover available models for a provider"""
        if provider.provider_type == "openai":
            self._discover_openai_models(db, provider)
        elif provider.provider_type == "anthropic":
            self._discover_anthropic_models(db, provider)
        elif provider.provider_type == "google":
            self._discover_google_models(db, provider)
        elif provider.provider_type == "ollama":
            self._discover_ollama_models(db, provider)
    
    def _discover_openai_models(self, db: Session, provider: ModelProvider):
        api_key = self.decrypt_api_key(provider.api_key_encrypted)
        client = openai.OpenAI(api_key=api_key)
        try:
            models = client.models.list()
            for model in models:
                if "gpt" in model.id:
                    db_model = AIModel(
                        provider_id=provider.id,
                        name=model.id,
                        model_type="chat",
                        model_metadata={"description": model.owned_by}
                    )
                    db.add(db_model)
            db.commit()
        except Exception as e:
            # Handle case where API key is invalid or has no access
            print(f"Could not discover OpenAI models: {e}")

    def _discover_anthropic_models(self, db: Session, provider: ModelProvider):
        # Anthropic does not have a public model list API yet.
        # Add common models manually.
        common_models = [
            "claude-3-opus-20240229", "claude-3-sonnet-20240229",
            "claude-3-haiku-20240307", "claude-2.1", "claude-2.0", "claude-instant-1.2"
        ]
        for model_name in common_models:
            db_model = AIModel(provider_id=provider.id, name=model_name, model_type="chat")
            db.add(db_model)
        db.commit()

    def _discover_google_models(self, db: Session, provider: ModelProvider):
        api_key = self.decrypt_api_key(provider.api_key_encrypted)
        genai.configure(api_key=api_key)
        try:
            for model in genai.list_models():
                if 'generateContent' in model.supported_generation_methods:
                    db_model = AIModel(
                        provider_id=provider.id,
                        name=model.name,
                        model_type="generative",
                        model_metadata={"supported_generation_methods": model.supported_generation_methods}
                    )
                    db.add(db_model)
            db.commit()
        except Exception as e:
            print(f"Could not discover Google models: {e}")

    def _discover_ollama_models(self, db: Session, provider: ModelProvider):
        try:
            response = requests.get(f"{provider.api_endpoint}/api/tags")
            response.raise_for_status()
            models = response.json().get("models", [])
            
            for model in models:
                db_model = AIModel(
                    provider_id=provider.id,
                    name=model.get("name"),
                    model_type="local",
                    model_metadata={"details": model.get("details", {})}
                )
                db.add(db_model)
            db.commit()
        except Exception as e:
            print(f"Could not discover Ollama models from {provider.api_endpoint}: {e}")
            
    def get_available_models(self, db: Session, user_id: uuid.UUID) -> List[AIModel]:
        return db.query(AIModel).join(ModelProvider).filter(
            ModelProvider.user_id == user_id,
            ModelProvider.is_active == True,
            AIModel.is_active == True
        ).all()