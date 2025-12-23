"""
Report router - API endpoints for reports and analytics
"""
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas import ReportCreate, ReportResponse
from app.services.report_service import ReportService
from app.middleware.auth_middleware import get_current_user, require_role

router = APIRouter()

@router.post("", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
def create_report(
    report: ReportCreate,
    current_user: dict = Depends(require_role(["pilot"])),
    db: Session = Depends(get_db)
):
    """
    Create a new report for an inspection (Pilots only)
    """
    service = ReportService(db)
    return service.create_report(report)

@router.get("/{inspection_id}", response_model=ReportResponse)
def get_report(
    inspection_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get report for a specific inspection
    """
    service = ReportService(db)
    report = service.get_report_by_inspection(inspection_id)
    
    # Auth check: Customer can only see their own reports
    if current_user["role"] == "customer":
        from app.models import Inspection
        inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
        if inspection.customer_id != current_user["user_id"]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your report")
            
    return report

@router.get("/customer/all", response_model=List[ReportResponse])
def get_my_reports(
    current_user: dict = Depends(require_role(["customer"])),
    db: Session = Depends(get_db)
):
    """
    Get all reports for the currently authenticated customer
    """
    service = ReportService(db)
    return service.get_customer_reports(current_user["user_id"])

@router.get("/analytics/me")
def get_my_analytics(
    current_user: dict = Depends(require_role(["customer"])),
    db: Session = Depends(get_db)
):
    """
    Get analytics dashboard data for the authenticated customer
    """
    service = ReportService(db)
    return service.get_analytics(current_user["user_id"])
