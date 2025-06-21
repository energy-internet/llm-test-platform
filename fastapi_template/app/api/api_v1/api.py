# app/api/api_v1/api.py
from fastapi import APIRouter
from app.api.api_v1.endpoints import auth, models, benchmarks, tests, reports, admin

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(models.router, prefix="/model-providers", tags=["model_providers"])
api_router.include_router(benchmarks.router, prefix="/benchmarks", tags=["benchmarks"])
api_router.include_router(tests.router, prefix="/tests", tags=["tests"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])