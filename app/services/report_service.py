"""
Report service - Business logic for inspection reports and analytics
"""
from sqlalchemy.orm import Session
from typing import List, Optional
from app.models import Report, Inspection
from app.schemas import ReportCreate
from fastapi import HTTPException, status

from app.services.storage_service import StorageService

class ReportService:
    """Service class for report-related operations"""
    
    def __init__(self, db: Session):
        self.db = db
        self.storage = StorageService()
        
    def _inject_signed_url(self, report: Report):
        """Helper to inject signed URL if image_url is a storage path"""
        if report and report.image_url and not report.image_url.startswith("http"):
            report.image_url = self.storage.get_signed_url(report.image_url)
        return report
    
    def create_report(self, data: ReportCreate) -> Report:
        """
        Create a new report for an inspection
        
        Args:
            data: Report creation data
            
        Returns:
            Created Report object
        """
        # Verify inspection exists
        inspection = self.db.query(Inspection).filter(Inspection.id == data.inspection_id).first()
        if not inspection:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Inspection {data.inspection_id} not found"
            )
            
        # Update inspection status to completed
        inspection.status = "completed"
        
        # Create report record
        new_report = Report(
            inspection_id=data.inspection_id,
            title=data.title,
            summary=data.summary,
            defect_classification=data.defect_classification,
            image_url=data.image_url,
            confidence=data.confidence
        )
        
        self.db.add(new_report)
        self.db.commit()
        self.db.refresh(new_report)
        
        return new_report
        
    def get_report_by_inspection(self, inspection_id: int) -> Report:
        """
        Get report for a specific inspection
        """
        report = self.db.query(Report).filter(Report.inspection_id == inspection_id).first()
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Report for inspection {inspection_id} not found"
            )
        return self._inject_signed_url(report)
        
    def get_customer_reports(self, customer_id: int) -> List[Report]:
        """
        List all reports for a specific customer
        """
        reports = self.db.query(Report).join(Inspection).filter(Inspection.customer_id == customer_id).all()
        return [self._inject_signed_url(r) for r in reports]
        
    def get_analytics(self, customer_id: int) -> dict:
        """
        Calculate analytics for a specific customer
        """
        total_inspections = self.db.query(Inspection).filter(Inspection.customer_id == customer_id).count()
        completed_inspections = self.db.query(Inspection).filter(
            Inspection.customer_id == customer_id, 
            Inspection.status == "completed"
        ).count()
        
        # Placeholder cost saving calculation
        cost_saved = completed_inspections * 500  # $500 saved per manual inspection
        
        next_booking = self.db.query(Inspection).filter(
            Inspection.customer_id == customer_id,
            Inspection.status == "pending"
        ).order_by(Inspection.scheduled_date.asc()).first()
        
        return {
            "total_inspections": total_inspections,
            "completed": completed_inspections,
            "cost_saved": cost_saved,
            "next_booking_date": next_booking.scheduled_date if next_booking else None
        }
