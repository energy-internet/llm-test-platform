# app/api/api_v1/endpoints/benchmarks.py
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
import json
import os
from pathlib import Path
from app.core.database import get_db
from app.api.api_v1.endpoints.auth import get_current_user
from app.schemas.benchmark import Benchmark, BenchmarkCreate, BenchmarkUpdate, BenchmarkUpload
from app.models.benchmark import Benchmark as BenchmarkModel
from app.models.user import User as UserModel
from app.core.config import settings

router = APIRouter()

@router.get("", response_model=List[Benchmark])
def get_benchmarks(
    benchmark_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all available benchmarks"""
    query = db.query(BenchmarkModel).filter(BenchmarkModel.is_active == True)
    
    if benchmark_type:
        query = query.filter(BenchmarkModel.benchmark_type == benchmark_type)
    
    return query.all()

@router.post("", response_model=Benchmark)
async def upload_custom_benchmark(
    name: str,
    benchmark_type: str = "custom",
    description: str = None,
    file: UploadFile = File(...),
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a custom benchmark file"""
    
    # Validate file type
    if not file.filename.endswith(('.json', '.csv', '.txt')):
        raise HTTPException(
            status_code=400, 
            detail="Only JSON, CSV, and TXT files are supported"
        )
    
    # Create upload directory if it doesn't exist
    upload_dir = Path(settings.UPLOAD_DIR) / "benchmarks"
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Save file
    file_path = upload_dir / f"{current_user.id}_{file.filename}"
    content = await file.read()
    
    if len(content) > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds maximum limit of {settings.MAX_FILE_SIZE} bytes"
        )
    
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Parse and validate benchmark data
    try:
        if file.filename.endswith('.json'):
            benchmark_data = json.loads(content.decode('utf-8'))
            config = {"format": "json", "test_cases": len(benchmark_data.get("test_cases", []))}
        else:
            config = {"format": file.filename.split('.')[-1], "file_size": len(content)}
    except Exception as e:
        os.remove(file_path)
        raise HTTPException(status_code=400, detail=f"Invalid file format: {str(e)}")
    
    # Create benchmark record
    benchmark = BenchmarkModel(
        name=name,
        description=description,
        benchmark_type=benchmark_type,
        config=config,
        file_path=str(file_path)
    )
    
    db.add(benchmark)
    db.commit()
    db.refresh(benchmark)
    
    return benchmark

@router.get("/{benchmark_id}", response_model=Benchmark)
def get_benchmark(
    benchmark_id: str,
    db: Session = Depends(get_db)
):
    """Get benchmark details"""
    benchmark = db.query(BenchmarkModel).filter(BenchmarkModel.id == benchmark_id).first()
    if not benchmark:
        raise HTTPException(status_code=404, detail="Benchmark not found")
    return benchmark

@router.get("/{benchmark_id}/cases")
def get_benchmark_test_cases(
    benchmark_id: str,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get test cases from a benchmark"""
    benchmark = db.query(BenchmarkModel).filter(BenchmarkModel.id == benchmark_id).first()
    if not benchmark:
        raise HTTPException(status_code=404, detail="Benchmark not found")
    
    if not benchmark.file_path or not os.path.exists(benchmark.file_path):
        raise HTTPException(status_code=404, detail="Benchmark file not found")
    
    try:
        with open(benchmark.file_path, 'r', encoding='utf-8') as f:
            if benchmark.config.get("format") == "json":
                data = json.load(f)
                test_cases = data.get("test_cases", [])[:limit]
                return {
                    "benchmark_id": benchmark_id,
                    "total_cases": len(data.get("test_cases", [])),
                    "sample_cases": test_cases
                }
            else:
                content = f.read()[:1000]  # First 1000 characters for preview
                return {
                    "benchmark_id": benchmark_id,
                    "format": benchmark.config.get("format"),
                    "preview": content
                }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading benchmark file: {str(e)}")

# Pre-defined benchmarks
@router.post("/predefined/elecbench", response_model=Benchmark)
def create_elecbench_benchmark(
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create ElecBench benchmark configuration"""
    benchmark = BenchmarkModel(
        name="ElecBench - Electrical Engineering",
        description="Professional benchmark for electrical engineering domain knowledge",
        benchmark_type="elecbench",
        config={
            "categories": ["power_systems", "electronics", "control_systems", "signal_processing"],
            "difficulty_levels": ["basic", "intermediate", "advanced"],
            "total_questions": 500
        }
    )
    
    db.add(benchmark)
    db.commit()
    db.refresh(benchmark)
    
    return benchmark

@router.post("/predefined/engibench", response_model=Benchmark)
def create_engibench_benchmark(
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create EngiBench benchmark configuration"""
    benchmark = BenchmarkModel(
        name="EngiBench - General Engineering",
        description="Comprehensive benchmark for general engineering knowledge",
        benchmark_type="engibench",
        config={
            "categories": ["mechanical", "civil", "chemical", "materials", "industrial"],
            "difficulty_levels": ["undergraduate", "graduate", "professional"],
            "total_questions": 750
        }
    )
    
    db.add(benchmark)
    db.commit()
    db.refresh(benchmark)
    
    return benchmark