# app/api/api_v1/endpoints/reports.py
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.api_v1.endpoints.auth import get_current_user
from app.schemas.report import Report, ReportCreate, ReportUpdate, ReportExport
from app.services.report_service import ReportService
from app.models.user import User as UserModel
import uuid

router = APIRouter()

@router.get("", response_model=List[Report])
def get_reports(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get all reports (for development)"""
    return ReportService.get_all_reports(db, skip, limit)

@router.post("", response_model=Report)
def create_report(
    report_data: ReportCreate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate a new report from test task"""
    return ReportService.create_report(db, current_user.id, report_data)

@router.get("/{report_id}", response_model=Report)
def get_report(
    report_id: str,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific report"""
    report = ReportService.get_report_by_id(db, uuid.UUID(report_id), current_user.id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

@router.put("/{report_id}", response_model=Report)
def update_report(
    report_id: str,
    update_data: ReportUpdate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a report"""
    report = ReportService.update_report(db, uuid.UUID(report_id), current_user.id, update_data)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

@router.delete("/{report_id}")
def delete_report(
    report_id: str,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a report"""
    success = ReportService.delete_report(db, uuid.UUID(report_id), current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Report not found")
    return {"message": "Report deleted successfully"}

@router.get("/{report_id}/export")
def export_report(
    report_id: str,
    format: str = "json",
    include_raw_data: bool = False,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export report in specified format"""
    export_request = ReportExport(format=format, include_raw_data=include_raw_data)
    export_data = ReportService.export_report(db, uuid.UUID(report_id), current_user.id, export_request)
    
    if format == "csv":
        return Response(
            content=export_data["data"],
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=report_{report_id}.csv"}
        )
    else:
        return export_data

@router.get("/{report_id}/visualizations")
def get_report_visualizations(
    report_id: str,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get report visualization data for charts"""
    report = ReportService.get_report_by_id(db, uuid.UUID(report_id), current_user.id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    return {
        "report_id": report_id,
        "visualizations": report.visualizations,
        "summary": report.summary
    }