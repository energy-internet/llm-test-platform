# app/tasks/test_tasks.py
from celery import current_task
from app.celery_config import celery_app
from app.core.database import SessionLocal
from app.services.test_service import TestService
from app.services.model_service import ModelService
from app.models.test_task import TestTask, TaskStatus
from app.models.benchmark import Benchmark
from app.models.model_provider import AIModel
from app.schemas.test_task import TaskStatusUpdate
from app.schemas.test_result import TestResultCreate
import logging
import json
import time
import uuid
from datetime import datetime
from openai import OpenAI

logger = logging.getLogger(__name__)

@celery_app.task(bind=True)
def execute_model_test(self, task_id: str):
    """Main task execution function"""
    db = SessionLocal()
    
    try:
        # Get task details
        task = db.query(TestTask).filter(TestTask.id == task_id).first()
        if not task:
            logger.error(f"Task {task_id} not found")
            return {"success": False, "error": "Task not found"}
        
        # Update task status to running
        TestService.update_task_status(
            db, uuid.UUID(task_id), 
            TaskStatusUpdate(status=TaskStatus.RUNNING, progress=0.0)
        )
        
        # Get benchmark and models
        benchmark = db.query(Benchmark).filter(Benchmark.id == task.benchmark_id).first()
        models = db.query(AIModel).filter(AIModel.id.in_(task.model_ids)).all()
        
        if not benchmark or not models:
            TestService.update_task_status(
                db, uuid.UUID(task_id),
                TaskStatusUpdate(
                    status=TaskStatus.FAILED,
                    error_message="Benchmark or models not found"
                )
            )
            return {"success": False, "error": "Benchmark or models not found"}
        
        # Load test cases
        test_cases = _load_benchmark_test_cases(benchmark)
        if not test_cases:
            TestService.update_task_status(
                db, uuid.UUID(task_id),
                TaskStatusUpdate(
                    status=TaskStatus.FAILED,
                    error_message="No test cases found in benchmark"
                )
            )
            return {"success": False, "error": "No test cases found"}
        
        # Execute tests
        total_tests = len(models) * len(test_cases)
        completed_tests = 0
        results = []
        
        for model in models:
            for test_case in test_cases:
                try:
                    # Update progress
                    progress = (completed_tests / total_tests) * 100
                    current_task.update_state(
                        state='PROGRESS',
                        meta={
                            'current': completed_tests,
                            'total': total_tests,
                            'progress': progress
                        }
                    )
                    
                    TestService.update_task_status(
                        db, uuid.UUID(task_id),
                        TaskStatusUpdate(status=TaskStatus.RUNNING, progress=progress)
                    )
                    
                    # Execute single test
                    result = _execute_single_model_test(db, model, test_case, task.config)
                    
                    # Save result to database
                    test_result = TestResultCreate(
                        task_id=uuid.UUID(task_id),
                        model_id=model.id,
                        test_case_id=test_case.get("id", str(completed_tests)),
                        input_data={"input": test_case.get("input", "")},
                        output_data={"output": result.get("response", "")},
                        score=result.get("score", 0.0),
                        metrics=result.get("metrics", {}),
                        execution_time=result.get("execution_time", 0.0)
                    )
                    
                    TestService.create_test_result(db, test_result)
                    results.append(result)
                    
                    completed_tests += 1
                    
                except Exception as e:
                    logger.error(f"Error in test execution: {str(e)}")
                    # Save failed result
                    test_result = TestResultCreate(
                        task_id=uuid.UUID(task_id),
                        model_id=model.id,
                        test_case_id=test_case.get("id", str(completed_tests)),
                        input_data={"input": test_case.get("input", "")},
                        output_data={"error": str(e)},
                        score=0.0,
                        metrics={},
                        execution_time=0.0
                    )
                    TestService.create_test_result(db, test_result)
                    completed_tests += 1
        
        # Mark task as completed
        TestService.update_task_status(
            db, uuid.UUID(task_id),
            TaskStatusUpdate(status=TaskStatus.COMPLETED, progress=100.0)
        )
        
        return {
            "success": True,
            "task_id": task_id,
            "total_tests": total_tests,
            "completed_tests": completed_tests,
            "results_summary": {
                "average_score": sum(r.get("score", 0) for r in results) / len(results) if results else 0,
                "total_execution_time": sum(r.get("execution_time", 0) for r in results)
            }
        }
        
    except Exception as e:
        logger.error(f"Task execution failed: {str(e)}")
        TestService.update_task_status(
            db, uuid.UUID(task_id),
            TaskStatusUpdate(
                status=TaskStatus.FAILED,
                error_message=str(e)
            )
        )
        return {"success": False, "error": str(e)}
    finally:
        db.close()

def _load_benchmark_test_cases(benchmark: Benchmark):
    """Load test cases from benchmark file"""
    try:
        if benchmark.benchmark_type == "elecbench":
            return _load_elecbench_cases()
        elif benchmark.benchmark_type == "engibench":
            return _load_engibench_cases()
        elif benchmark.file_path:
            with open(benchmark.file_path, 'r', encoding='utf-8') as f:
                if benchmark.file_path.endswith('.json'):
                    data = json.load(f)
                    return data.get("test_cases", [])
                else:
                    # For CSV or TXT files, create simple test cases
                    content = f.read()
                    lines = content.strip().split('\n')
                    return [{"id": str(i), "input": line.strip(), "expected_output": ""} 
                           for i, line in enumerate(lines[:100])]  # Limit to 100 cases
        else:
            return []
    except Exception as e:
        logger.error(f"Error loading benchmark test cases: {str(e)}")
        return []

def _load_elecbench_cases():
    """Load ElecBench test cases"""
    return [
        {
            "id": "elec_001",
            "input": "What is Ohm's law and how is it applied in electrical circuits?",
            "expected_output": "V = I * R",
            "category": "basic_theory",
            "difficulty": "basic"
        },
        {
            "id": "elec_002", 
            "input": "Calculate the power dissipation in a 100-ohm resistor with 2A current.",
            "expected_output": "400W",
            "category": "power_calculations",
            "difficulty": "intermediate"
        },
        {
            "id": "elec_003",
            "input": "Explain the working principle of a three-phase induction motor.",
            "expected_output": "rotating magnetic field",
            "category": "machines",
            "difficulty": "advanced"
        }
    ]

def _load_engibench_cases():
    """Load EngiBench test cases"""
    return [
        {
            "id": "eng_001",
            "input": "What are the fundamental principles of thermodynamics?",
            "expected_output": "conservation of energy",
            "category": "thermodynamics",
            "difficulty": "undergraduate"
        },
        {
            "id": "eng_002",
            "input": "Calculate the stress in a steel beam under 10kN load with cross-sectional area 0.01 m².",
            "expected_output": "1 MPa",
            "category": "mechanics",
            "difficulty": "graduate"
        },
        {
            "id": "eng_003",
            "input": "Design considerations for a chemical reactor with heat transfer requirements.",
            "expected_output": "heat exchanger design",
            "category": "chemical_engineering",
            "difficulty": "professional"
        }
    ]

def _execute_single_model_test(db, model: AIModel, test_case: dict, config: dict):
    """Execute a single model test case"""
    start_time = time.time()
    
    try:
        model_service = ModelService()
        provider = model.provider
        
        # Decrypt API key
        api_key = model_service.decrypt_api_key(provider.api_key_encrypted)
        
        # Get test parameters from config
        temperature = config.get("temperature", 0.7)
        max_tokens = config.get("max_tokens", 1000)
        timeout = config.get("timeout", 30)
        
        # Execute based on provider type
        if provider.provider_type == "openai":
            response = _execute_openai_test(api_key, model.name, test_case, temperature, max_tokens)
        elif provider.provider_type == "anthropic":
            response = _execute_anthropic_test(api_key, model.name, test_case, max_tokens)
        elif provider.provider_type == "google":
            response = _execute_google_test(api_key, model.name, test_case)
        elif provider.provider_type == "deepseek":
            response = _execute_deepseek_test(api_key, provider.api_endpoint, model.name, test_case)
        else:
            raise ValueError(f"Unsupported provider: {provider.provider_type}")
        
        execution_time = time.time() - start_time
        
        # Calculate metrics
        score = _calculate_test_score(test_case, response)
        metrics = _calculate_metrics(test_case, response, execution_time)
        
        return {
            "success": True,
            "response": response,
            "score": score,
            "metrics": metrics,
            "execution_time": execution_time
        }
        
    except Exception as e:
        execution_time = time.time() - start_time
        return {
            "success": False,
            "error": str(e),
            "response": "",
            "score": 0.0,
            "metrics": {},
            "execution_time": execution_time
        }

def _execute_openai_test(api_key, model_name, test_case, temperature, max_tokens):
    """Execute test on OpenAI model"""
    import openai
    
    client = openai.OpenAI(api_key=api_key)
    response = client.chat.completions.create(
        model=model_name,
        messages=[{"role": "user", "content": test_case["input"]}],
        temperature=temperature,
        max_tokens=max_tokens
    )
    
    return response.choices[0].message.content

def _execute_anthropic_test(api_key, model_name, test_case, max_tokens):
    """Execute test on Anthropic model"""
    import anthropic
    
    client = anthropic.Anthropic(api_key=api_key)
    response = client.messages.create(
        model=model_name,
        max_tokens=max_tokens,
        messages=[{"role": "user", "content": test_case["input"]}]
    )
    
    return response.content[0].text

def _execute_google_test(api_key, model_name, test_case):
    """Execute test on Google model"""
    import google.generativeai as genai
    
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(model_name)
    response = model.generate_content(test_case["input"])
    
    return response.text

def _execute_deepseek_test(api_key, api_endpoint, model_name, test_case):
    """Execute test on DeepSeek model"""
    import logging
    import time
    from openai import OpenAI
    
    logger = logging.getLogger(__name__)
    logger.info(f"执行DeepSeek模型测试，模型: {model_name}")
    
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
        
        response = client.chat.completions.create(
            model=model_name,  # 使用传入的模型名称
            messages=[{"role": "user", "content": test_case["input"]}],
            max_tokens=1000
        )
        
        logger.info(f"DeepSeek测试响应成功")
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"DeepSeek测试执行失败: {str(e)}", exc_info=True)
        raise ValueError(f"DeepSeek模型调用失败: {str(e)}")

def _calculate_test_score(test_case, response):
    """Calculate test score"""
    expected = test_case.get("expected_output", "")
    if not expected:
        return 1.0
    
    from difflib import SequenceMatcher
    similarity = SequenceMatcher(None, expected.lower(), response.lower()).ratio()
    return float(similarity)

def _calculate_metrics(test_case, response, execution_time):
    """Calculate additional metrics"""
    return {
        "response_length": len(response),
        "words_count": len(response.split()),
        "execution_time": execution_time,
        "category": test_case.get("category", "general"),
        "difficulty": test_case.get("difficulty", "unknown")
    }

@celery_app.task
def cleanup_old_results():
    """Cleanup old test results and files"""
    db = SessionLocal()
    
    try:
        from datetime import datetime, timedelta
        
        # Delete results older than 30 days
        cutoff_date = datetime.utcnow() - timedelta(days=30)
        
        old_tasks = db.query(TestTask).filter(
            TestTask.created_at < cutoff_date,
            TestTask.status.in_([TaskStatus.COMPLETED, TaskStatus.FAILED, TaskStatus.CANCELLED])
        ).all()
        
        deleted_count = 0
        for task in old_tasks:
            # Delete associated results
            from app.models.test_result import TestResult
            db.query(TestResult).filter(TestResult.task_id == task.id).delete()
            
            # Delete task
            db.delete(task)
            deleted_count += 1
        
        db.commit()
        logger.info(f"Cleaned up {deleted_count} old tasks and their results")
        
        return {"success": True, "deleted_tasks": deleted_count}
        
    except Exception as e:
        logger.error(f"Cleanup failed: {str(e)}")
        return {"success": False, "error": str(e)}
    finally:
        db.close()