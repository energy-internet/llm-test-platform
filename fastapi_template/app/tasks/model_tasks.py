# app/tasks/model_tasks.py
from celery import current_task
from app.celery_config import celery_app
from app.core.database import SessionLocal
from app.services.model_service import ModelService
from app.models.model_provider import ModelProvider, AIModel
import logging
import time
import uuid

logger = logging.getLogger(__name__)

@celery_app.task(bind=True)
def model_health_check(self, provider_id: str):
    """Periodic health check for model providers"""
    db = SessionLocal()
    try:
        model_service = ModelService()
        provider = db.query(ModelProvider).filter(ModelProvider.id == provider_id).first()
        
        if not provider:
            logger.warning(f"Provider {provider_id} not found")
            return {"success": False, "error": "Provider not found"}
        
        # Test connection
        from app.schemas.model_provider import ModelTestRequest
        test_request = ModelTestRequest(
            provider_id=uuid.UUID(provider_id),
            test_message="Health check"
        )
        
        result = model_service.test_provider_connection(
            db, uuid.UUID(provider_id), provider.user_id, test_request
        )
        
        # Update provider status based on result
        provider.is_active = result["success"]
        db.commit()
        
        logger.info(f"Health check for provider {provider_id}: {'passed' if result['success'] else 'failed'}")
        return result
        
    except Exception as e:
        logger.error(f"Health check failed for provider {provider_id}: {str(e)}")
        return {"success": False, "error": str(e)}
    finally:
        db.close()

@celery_app.task(bind=True)
def batch_model_evaluation(self, model_ids: list, test_cases: list):
    """Batch evaluation of multiple models on test cases"""
    db = SessionLocal()
    results = []
    
    try:
        total_tasks = len(model_ids) * len(test_cases)
        completed_tasks = 0
        
        for model_id in model_ids:
            model = db.query(AIModel).filter(AIModel.id == model_id).first()
            if not model:
                continue
                
            for i, test_case in enumerate(test_cases):
                try:
                    # Update task progress
                    current_task.update_state(
                        state='PROGRESS',
                        meta={
                            'current': completed_tasks,
                            'total': total_tasks,
                            'model_id': model_id,
                            'test_case': i
                        }
                    )
                    
                    # Execute single model test
                    result = _execute_single_test(db, model, test_case)
                    results.append(result)
                    
                    completed_tasks += 1
                    
                except Exception as e:
                    logger.error(f"Error testing model {model_id} on case {i}: {str(e)}")
                    results.append({
                        "model_id": model_id,
                        "test_case_id": str(i),
                        "success": False,
                        "error": str(e)
                    })
                    completed_tasks += 1
        
        return {
            "success": True,
            "total_results": len(results),
            "successful_tests": len([r for r in results if r.get("success", False)]),
            "results": results
        }
        
    except Exception as e:
        logger.error(f"Batch evaluation failed: {str(e)}")
        return {"success": False, "error": str(e)}
    finally:
        db.close()

def _execute_single_test(db, model, test_case):
    """Execute a single model test"""
    start_time = time.time()
    
    try:
        model_service = ModelService()
        provider = model.provider
        
        # Decrypt API key
        api_key = model_service.decrypt_api_key(provider.api_key_encrypted)
        
        # Execute test based on provider type
        if provider.provider_type == "openai":
            result = _test_openai_model(api_key, model.name, test_case)
        elif provider.provider_type == "anthropic":
            result = _test_anthropic_model(api_key, model.name, test_case)
        elif provider.provider_type == "google":
            result = _test_google_model(api_key, model.name, test_case)
        else:
            raise ValueError(f"Unsupported provider type: {provider.provider_type}")
        
        execution_time = time.time() - start_time
        
        return {
            "model_id": str(model.id),
            "test_case_id": test_case.get("id", "unknown"),
            "success": True,
            "response": result,
            "execution_time": execution_time,
            "score": _calculate_score(test_case, result)
        }
        
    except Exception as e:
        execution_time = time.time() - start_time
        return {
            "model_id": str(model.id),
            "test_case_id": test_case.get("id", "unknown"),
            "success": False,
            "error": str(e),
            "execution_time": execution_time,
            "score": 0.0
        }

def _test_openai_model(api_key, model_name, test_case):
    """Test OpenAI model"""
    import openai
    
    client = openai.OpenAI(api_key=api_key)
    response = client.chat.completions.create(
        model=model_name,
        messages=[{"role": "user", "content": test_case.get("input", "")}],
        max_tokens=test_case.get("max_tokens", 1000),
        temperature=test_case.get("temperature", 0.7)
    )
    
    return response.choices[0].message.content

def _test_anthropic_model(api_key, model_name, test_case):
    """Test Anthropic model"""
    import anthropic
    
    client = anthropic.Anthropic(api_key=api_key)
    response = client.messages.create(
        model=model_name,
        max_tokens=test_case.get("max_tokens", 1000),
        messages=[{"role": "user", "content": test_case.get("input", "")}]
    )
    
    return response.content[0].text

def _test_google_model(api_key, model_name, test_case):
    """Test Google model"""
    import google.generativeai as genai
    
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(model_name)
    response = model.generate_content(test_case.get("input", ""))
    
    return response.text

def _calculate_score(test_case, response):
    """Calculate test score based on expected output"""
    expected = test_case.get("expected_output", "")
    if not expected:
        return 1.0  # Default score if no expected output
    
    # Simple similarity scoring (can be enhanced with more sophisticated methods)
    from difflib import SequenceMatcher
    similarity = SequenceMatcher(None, expected.lower(), response.lower()).ratio()
    return float(similarity)