# app/services/report_service.py
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.report import Report
from app.models.test_task import TestTask
from app.models.test_result import TestResult
from app.schemas.report import ReportCreate, ReportUpdate, ReportExport
from typing import List, Optional, Dict, Any
import uuid
import json
import pandas as pd
from io import StringIO
import statistics

class ReportService:
    @staticmethod
    def create_report(db: Session, user_id: uuid.UUID, report_data: ReportCreate) -> Report:
        # Verify task belongs to user
        task = db.query(TestTask).filter(
            TestTask.id == report_data.task_id,
            TestTask.user_id == user_id
        ).first()
        
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        # Generate report summary and visualizations
        summary, visualizations = ReportService._generate_report_data(db, report_data.task_id)
        
        db_report = Report(
            task_id=report_data.task_id,
            user_id=user_id,
            title=report_data.title,
            summary=summary,
            visualizations=visualizations,
            is_public=report_data.is_public
        )
        
        db.add(db_report)
        db.commit()
        db.refresh(db_report)
        return db_report
    
    @staticmethod
    def get_user_reports(db: Session, user_id: uuid.UUID, skip: int = 0, limit: int = 50) -> List[Report]:
        return db.query(Report).filter(
            Report.user_id == user_id
        ).order_by(Report.created_at.desc()).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_all_reports(db: Session, skip: int = 0, limit: int = 50) -> List[Report]:
        return db.query(Report).order_by(Report.created_at.desc()).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_report_by_id(db: Session, report_id: uuid.UUID, user_id: uuid.UUID) -> Optional[Report]:
        return db.query(Report).filter(
            Report.id == report_id,
            Report.user_id == user_id
        ).first()
    
    @staticmethod
    def update_report(db: Session, report_id: uuid.UUID, user_id: uuid.UUID, update_data: ReportUpdate) -> Optional[Report]:
        report = ReportService.get_report_by_id(db, report_id, user_id)
        if not report:
            return None
        
        update_dict = update_data.dict(exclude_unset=True)
        for field, value in update_dict.items():
            setattr(report, field, value)
        
        db.commit()
        db.refresh(report)
        return report
    
    @staticmethod
    def delete_report(db: Session, report_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        report = ReportService.get_report_by_id(db, report_id, user_id)
        if not report:
            return False
        
        db.delete(report)
        db.commit()
        return True
    
    @staticmethod
    def export_report(db: Session, report_id: uuid.UUID, user_id: uuid.UUID, export_request: ReportExport) -> Dict[str, Any]:
        report = ReportService.get_report_by_id(db, report_id, user_id)
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        if export_request.format == "json":
            return ReportService._export_json(report, include_raw_data=export_request.include_raw_data)
        elif export_request.format == "csv":
            return ReportService._export_csv(db, report, include_raw_data=export_request.include_raw_data)
        else:
            raise HTTPException(status_code=400, detail="Unsupported export format")
    
    @staticmethod
    def _generate_report_data(db: Session, task_id: uuid.UUID) -> tuple[Dict[str, Any], Dict[str, Any]]:
        # Get test results
        results = db.query(TestResult).filter(TestResult.task_id == task_id).all()
        
        if not results:
            return {}, {}
        
        # Calculate summary statistics
        scores = [r.score for r in results if r.score is not None]
        execution_times = [r.execution_time for r in results if r.execution_time is not None]
        
        summary = {
            "total_tests": len(results),
            "average_score": statistics.mean(scores) if scores else 0,
            "median_score": statistics.median(scores) if scores else 0,
            "min_score": min(scores) if scores else 0,
            "max_score": max(scores) if scores else 0,
            "average_execution_time": statistics.mean(execution_times) if execution_times else 0,
            "total_execution_time": sum(execution_times) if execution_times else 0
        }
        
        # Group results by model for comparison
        model_results = {}
        for result in results:
            model_id = str(result.model_id)
            if model_id not in model_results:
                model_results[model_id] = {
                    "scores": [],
                    "execution_times": [],
                    "test_count": 0
                }
            
            if result.score is not None:
                model_results[model_id]["scores"].append(result.score)
            if result.execution_time is not None:
                model_results[model_id]["execution_times"].append(result.execution_time)
            model_results[model_id]["test_count"] += 1
        
        # Calculate model comparison data
        model_comparison = {}
        for model_id, data in model_results.items():
            model_comparison[model_id] = {
                "average_score": statistics.mean(data["scores"]) if data["scores"] else 0,
                "average_execution_time": statistics.mean(data["execution_times"]) if data["execution_times"] else 0,
                "test_count": data["test_count"]
            }
        
        visualizations = {
            "model_comparison": model_comparison,
            "score_distribution": {
                "bins": [0, 0.2, 0.4, 0.6, 0.8, 1.0],
                "counts": ReportService._calculate_score_distribution(scores)
            },
            "execution_time_chart": {
                "model_times": {k: v["average_execution_time"] for k, v in model_comparison.items()}
            }
        }
        
        return summary, visualizations
    
    @staticmethod
    def _calculate_score_distribution(scores: List[float]) -> List[int]:
        if not scores:
            return [0, 0, 0, 0, 0]
        
        bins = [0, 0.2, 0.4, 0.6, 0.8, 1.0]
        counts = [0] * (len(bins) - 1)
        
        for score in scores:
            for i in range(len(bins) - 1):
                if bins[i] <= score < bins[i + 1]:
                    counts[i] += 1
                    break
                elif score == 1.0 and i == len(bins) - 2:
                    counts[i] += 1
        
        return counts
    
    @staticmethod
    def _export_json(report: Report, include_raw_data: bool = False) -> Dict[str, Any]:
        data = {
            "report_id": str(report.id),
            "title": report.title,
            "created_at": report.created_at.isoformat(),
            "summary": report.summary,
            "visualizations": report.visualizations
        }
        
        return {"format": "json", "data": data}
    
    @staticmethod
    def _export_csv(db: Session, report: Report, include_raw_data: bool = False) -> Dict[str, Any]:
        if not include_raw_data:
            # Export summary data only
            summary_data = []
            if report.summary:
                for key, value in report.summary.items():
                    summary_data.append({"metric": key, "value": value})
            
            df = pd.DataFrame(summary_data)
            csv_buffer = StringIO()
            df.to_csv(csv_buffer, index=False)
            csv_content = csv_buffer.getvalue()
        else:
            # Export raw test results
            results = db.query(TestResult).filter(TestResult.task_id == report.task_id).all()
            results_data = []
            
            for result in results:
                results_data.append({
                    "model_id": str(result.model_id),
                    "test_case_id": result.test_case_id,
                    "score": result.score,
                    "execution_time": result.execution_time,
                    "created_at": result.created_at.isoformat()
                })
            
            df = pd.DataFrame(results_data)
            csv_buffer = StringIO()
            df.to_csv(csv_buffer, index=False)
            csv_content = csv_buffer.getvalue()
        
        return {"format": "csv", "data": csv_content}