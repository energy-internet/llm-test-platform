# app/main.py
from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
import time
import logging
from sqlalchemy import text
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.api.api_v1.api import api_router
from app.celery_config import celery_app
from app.services.auth_service import AuthService
from app.schemas.user import UserCreate, UserRole

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI Model Evaluation Platform - Compare and benchmark AI models across different providers",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    try:
        # Check if admin user exists
        admin_user = AuthService.get_user_by_username(db, "admin")
        if not admin_user:
            logger.info("Admin user not found, creating one.")
            admin_user_in = UserCreate(
                username="admin",
                email="admin@example.com",
                password="admin123",
                role=UserRole.ADMIN
            )
            AuthService.create_user(db, admin_user_in)
            logger.info("Admin user created successfully.")
        else:
            logger.info("Admin user already exists.")
    except Exception as e:
        logger.error(f"Error during startup user creation: {e}", exc_info=True)
    finally:
        db.close()

# Custom middleware for request logging
class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Log request
        logger.info(f"Request: {request.method} {request.url}")
        
        # Process request
        response = await call_next(request)
        
        # Log response
        process_time = time.time() - start_time
        logger.info(f"Response: {response.status_code} - {process_time:.3f}s")
        
        return response

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Add trusted host middleware
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=["localhost", "127.0.0.1", "*.localhost"]
)

# Add logging middleware
app.add_middleware(LoggingMiddleware)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "AI Model Evaluation Platform API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "api_v1": settings.API_V1_STR
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        
        # Test Redis connection
        from app.core.database import redis_client
        redis_client.ping()
        
        return {
            "status": "healthy",
            "timestamp": time.time(),
            "database": "connected",
            "redis": "connected"
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=503, detail="Service unavailable")

@app.get("/metrics")
async def get_metrics():
    """Basic metrics endpoint"""
    db = SessionLocal()
    try:
        metrics = {
            "users": {
                "total": db.query(User).count(),
                "active": db.query(User).filter(User.is_active == True).count()
            },
            "providers": {
                "total": db.query(ModelProvider).count(),
                "active": db.query(ModelProvider).filter(ModelProvider.is_active == True).count()
            },
            "tasks": {
                "total": db.query(TestTask).count(),
                "pending": db.query(TestTask).filter(TestTask.status == TaskStatus.PENDING).count(),
                "running": db.query(TestTask).filter(TestTask.status == TaskStatus.RUNNING).count(),
                "completed": db.query(TestTask).filter(TestTask.status == TaskStatus.COMPLETED).count()
            }
        }
        return metrics
    finally:
        db.close()

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )