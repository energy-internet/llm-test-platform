# app/schemas/__init__.py
from app.schemas.user import User, UserCreate, UserUpdate, UserInDB
from app.schemas.model_provider import ModelProvider, ModelProviderCreate, ModelProviderUpdate
from app.schemas.benchmark import Benchmark, BenchmarkCreate, BenchmarkUpdate
from app.schemas.test_task import TestTask, TestTaskCreate, TestTaskUpdate
from app.schemas.test_result import TestResult, TestResultCreate
from app.schemas.report import Report, ReportCreate, ReportUpdate

__all__ = [
    "User", "UserCreate", "UserUpdate", "UserInDB",
    "ModelProvider", "ModelProviderCreate", "ModelProviderUpdate",
    "Benchmark", "BenchmarkCreate", "BenchmarkUpdate",
    "TestTask", "TestTaskCreate", "TestTaskUpdate",
    "TestResult", "TestResultCreate",
    "Report", "ReportCreate", "ReportUpdate"
]