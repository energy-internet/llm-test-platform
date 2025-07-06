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
import vertexai
from google.cloud import aiplatform
from google.oauth2 import service_account
import requests
from typing import List, Optional, Dict, Any
import json
import logging
from openai import OpenAI  # 使用OpenAI客户端库

class ModelService:
    def __init__(self):
        self.cipher_suite = Fernet(settings.SECRET_KEY.encode())
    
    def encrypt_data(self, data: str) -> str:
        return self.cipher_suite.encrypt(data.encode()).decode()

    def decrypt_data(self, encrypted_data: str) -> str:
        return self.cipher_suite.decrypt(encrypted_data.encode()).decode()
    
    def create_model_provider(self, db: Session, user_id: uuid.UUID, provider_data: ModelProviderCreate) -> ModelProvider:
        encrypted_key = None
        if provider_data.api_key:
            encrypted_key = self.encrypt_data(provider_data.api_key)
        
        encrypted_credentials = None
        if provider_data.credentials:
            encrypted_credentials = self.encrypt_data(provider_data.credentials)

        db_provider = ModelProvider(
            user_id=user_id,
            name=provider_data.name,
            provider_type=provider_data.provider_type,
            api_endpoint=provider_data.api_endpoint,
            api_key_encrypted=encrypted_key,
            credentials_encrypted=encrypted_credentials,
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
        
        if 'api_key' in update_dict and update_dict['api_key']:
            update_dict['api_key_encrypted'] = self.encrypt_data(update_dict.pop('api_key'))
        
        if 'credentials' in update_dict and update_dict['credentials']:
            update_dict['credentials_encrypted'] = self.encrypt_data(update_dict.pop('credentials'))

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
            # 对于Ollama，不需要API密钥
            if provider.provider_type == "ollama":
                return self._test_ollama(provider.api_endpoint, test_request.test_message)
                
            # 对于其他提供商，需要API密钥
            api_key = self.decrypt_data(provider.api_key_encrypted) if provider.api_key_encrypted else None
            
            if provider.provider_type == "openai":
                return self._test_openai(api_key, test_request.test_message)
            elif provider.provider_type == "anthropic":
                return self._test_anthropic(api_key, test_request.test_message)
            elif provider.provider_type == "google":
                return self._test_google(api_key, test_request.test_message)
            elif provider.provider_type == "google_vertex_ai":
                credentials_json = self.decrypt_data(provider.credentials_encrypted)
                return self._test_google_vertex_ai(credentials_json, provider.config, test_request.test_message)
            elif provider.provider_type == "deepseek":
                return self._test_deepseek(api_key, provider.api_endpoint, test_request.test_message)
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
        
        # 尝试解析 api_key 是否为有效的 JSON
        try:
            # 检查 api_key 是否是 JSON 格式的服务账号凭据
            import json
            credentials_data = json.loads(api_key)
            
            # 如果包含 "type": "service_account"，则视为 Vertex AI 凭据
            if credentials_data.get("type") == "service_account":
                # 使用 Vertex AI
                credentials = service_account.Credentials.from_service_account_info(credentials_data)
                
                # 从 credentials_data 中提取项目信息，如果没有则使用默认值
                project_id = credentials_data.get("project_id")
                
                try:
                    aiplatform.init(
                        project=project_id,
                        location="us-central1", # 默认区域，可以从配置中获取
                        credentials=credentials
                    )
                    
                    # 使用 Vertex AI 的 gemini-pro
                    model = vertexai.preview.generative_models.GenerativeModel("gemini-pro")
                    response = model.generate_content(message)
                    
                    response_time = time.time() - start_time
                    
                    return {
                        "success": True,
                        "error": None,
                        "response_time": response_time,
                        "model_info": {
                            "model": "gemini-pro (Vertex AI)",
                            "response": response.candidates[0].content.parts[0].text
                        }
                    }
                except Exception as e:
                    return {
                        "success": False,
                        "error": f"Vertex AI Error: {str(e)}",
                        "response_time": time.time() - start_time,
                        "model_info": None
                    }
        except (json.JSONDecodeError, AttributeError, KeyError):
            # 不是服务账号凭据，使用普通的 API 密钥
            pass
        
        # 标准的 Google AI (Gemini) API 调用
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
    
    def _test_google_vertex_ai(self, credentials_json: str, config: Dict[str, Any], message: str) -> Dict[str, Any]:
        import time
        start_time = time.time()

        credentials = service_account.Credentials.from_service_account_info(json.loads(credentials_json))
        aiplatform.init(
            project=config.get('project_id'),
            location=config.get('location'),
            credentials=credentials
        )
        model = vertexai.preview.generative_models.GenerativeModel("gemini-pro")
        response = model.generate_content(message)

        response_time = time.time() - start_time

        return {
            "success": True,
            "error": None,
            "response_time": response_time,
            "model_info": {
                "model": "gemini-pro (Vertex AI)",
                "response": response.candidates[0].content.parts[0].text
            }
        }

    def _test_deepseek(self, api_key: str, api_endpoint: str, message: str) -> Dict[str, Any]:
        import time
        import logging
        from openai import OpenAI  # 使用OpenAI客户端库
        
        logger = logging.getLogger(__name__)
        logger.info(f"测试DeepSeek API连接，端点: {api_endpoint}")
        
        start_time = time.time()
        
        try:
            # 确保API端点格式正确
            if api_endpoint.endswith('/'):
                api_endpoint = api_endpoint.rstrip('/')
                
            # DeepSeek API使用根路径即可，不需要/v1
            if api_endpoint.endswith('/v1'):
                api_endpoint = api_endpoint[:-3]
                
            logger.info(f"使用API端点: {api_endpoint}")
            
            # 创建OpenAI客户端，指向DeepSeek API
            client = OpenAI(api_key=api_key, base_url=api_endpoint)
            
            # 使用OpenAI格式的调用
            response = client.chat.completions.create(
                model="deepseek-chat",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant"},
                    {"role": "user", "content": message}
                ],
                max_tokens=100
            )
            
            response_time = time.time() - start_time
            logger.info(f"DeepSeek请求成功，响应时间: {response_time:.3f}秒")
            
            return {
                "success": True,
                "error": None,
                "response_time": response_time,
                "model_info": {
                    "model": "deepseek-chat",
                    "response": response.choices[0].message.content
                }
            }
        except Exception as e:
            logger.error(f"DeepSeek API错误: {str(e)}", exc_info=True)
            return {
                "success": False,
                "error": f"DeepSeek API Error: {str(e)}",
                "response_time": time.time() - start_time,
                "model_info": None
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
        elif provider.provider_type == "google_vertex_ai":
            self._discover_google_vertex_ai_models(db, provider)
        elif provider.provider_type == "ollama":
            self._discover_ollama_models(db, provider)
        elif provider.provider_type == "deepseek":
            self._discover_deepseek_models(db, provider)
    
    def _discover_openai_models(self, db: Session, provider: ModelProvider):
        api_key = self.decrypt_data(provider.api_key_encrypted)
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
        api_key = self.decrypt_data(provider.api_key_encrypted)
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

    def _discover_google_vertex_ai_models(self, db: Session, provider: ModelProvider):
        # Vertex AI model discovery can be complex.
        # For now, let's add gemini-pro and gemini-pro-vision manually,
        # similar to how other models are handled.
        
        # You would typically use aiplatform.list_models() here, but it can be slow
        # and requires more filtering.
        
        credentials_json = self.decrypt_data(provider.credentials_encrypted)
        credentials = service_account.Credentials.from_service_account_info(json.loads(credentials_json))

        aiplatform.init(
            project=provider.config.get('project_id'),
            location=provider.config.get('location'),
            credentials=credentials
        )

        # For simplicity, we add known Gemini models on Vertex AI
        known_models = {
            "gemini-1.0-pro": "text",
            "gemini-1.0-pro-vision": "multimodal"
        }

        for model_name, model_type in known_models.items():
            db_model = AIModel(
                provider_id=provider.id,
                name=f"{model_name} (Vertex AI)",
                model_type=model_type,
                model_metadata={"source": "vertex-ai"}
            )
            db.add(db_model)
        
        db.commit()

    def _discover_deepseek_models(self, db: Session, provider: ModelProvider):
        """Discover DeepSeek models"""
        # DeepSeek官方API使用'deepseek-chat'作为模型名称
        # 主要模型和版本
        deepseek_models = [
            {"name": "deepseek-chat", "description": "DeepSeek Chat (DeepSeek-V3)"},
            {"name": "deepseek-reasoner", "description": "DeepSeek Reasoner (DeepSeek-R1)"},
            {"name": "deepseek-coder", "description": "DeepSeek Coder"},
        ]
        
        for model in deepseek_models:
            db_model = AIModel(
                provider_id=provider.id,
                name=model["name"],
                model_type="chat",
                model_metadata={"description": model["description"]}
            )
            db.add(db_model)
        db.commit()

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