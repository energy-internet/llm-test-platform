# app/core/config.py
from pydantic_settings import BaseSettings
from pydantic import PostgresDsn
from typing import Optional, List
import secrets
import base64
import os

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "AI Model Evaluation Platform"
    
    # Database
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "ai_eval_platform"
    POSTGRES_PORT: int = 5432
    # 初始化为None，将在构造函数后设置
    SQLALCHEMY_DATABASE_URI: Optional[str] = "sqlite:///ai_eval_platform.db"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Security
    # 生成符合Fernet要求的32字节base64编码密钥
    SECRET_KEY: str = base64.urlsafe_b64encode(secrets.token_bytes(32)).decode()
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"
    
    # AI Model API Keys
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    GOOGLE_API_KEY: Optional[str] = None
    DEEPSEEK_API_KEY: Optional[str] = None
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173", 
        "http://localhost:5174", 
        "http://localhost:5175", 
        "http://localhost:8080"
    ]
    
    # File Upload
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50MB
    
    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"
    
    # 配置
    model_config = {
        "case_sensitive": True,
        "env_file": ".env"
    }

settings = Settings()

# 设置PostgreSQL连接URI - 注释掉这行，因为我们已经设置了SQLite URI
# settings.SQLALCHEMY_DATABASE_URI = f"postgresql://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}@{settings.POSTGRES_SERVER}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}"