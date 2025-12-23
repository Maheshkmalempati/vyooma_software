"""
Inspection service - Business logic for inspection management
Separates database operations from API routing
"""
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional
from app.models import Inspection
from app.schemas import InspectionCreate
from fastapi import HTTPException, status

class InspectionService:
    """Service class for inspection-related operations"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_inspection(self, customer_id: int, data: InspectionCreate) -> Inspection:
        """
        Create a new inspection for a customer
        
        Args:
            customer_id: ID of the customer creating the inspection
            data: Inspection creation data
        
        Returns:
            Created Inspection object
        """
        inspection = Inspection(
            customer_id=customer_id,
            location=data.location,
            scheduled_date=data.scheduled_date,
            package=data.package,
            status="pending",
            analysis_status="not_started"  # Will be added to model
        )
        
        self.db.add(inspection)
        self.db.commit()
        self.db.refresh(inspection)
        
        return inspection
    
    def list_inspections(
        self, 
        user_id: int, 
        role: str, 
        status_filter: Optional[str] = None
    ) -> List[Inspection]:
        """
        List inspections based on user role
        
        Args:
            user_id: Current user ID
            role: User role (customer/pilot)
            status_filter: Optional status filter
        
        Returns:
            List of Inspection objects
        """
        query = self.db.query(Inspection)
        
        if role == "customer":
            # Customers see only their own inspections
            query = query.filter(Inspection.customer_id == user_id)
        elif role == "pilot":
            # Pilots see pending inspections or ones assigned to them
            query = query.filter(
                (Inspection.pilot_id == user_id) | 
                (Inspection.status == "pending")
            )
        
        if status_filter:
            query = query.filter(Inspection.status == status_filter)
        
        return query.order_by(Inspection.created_at.desc()).all()
    
    def get_inspection(self, inspection_id: int) -> Inspection:
        """
        Get a single inspection by ID
        
        Args:
            inspection_id: Inspection ID
        
        Returns:
            Inspection object
        
        Raises:
            HTTPException: 404 if not found
        """
        inspection = self.db.query(Inspection).filter(
            Inspection.id == inspection_id
        ).first()
        
        if not inspection:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Inspection {inspection_id} not found"
            )
        
        return inspection
    
    def assign_pilot(self, inspection_id: int, pilot_id: int) -> Inspection:
        """
        Assign a pilot to an inspection
        
        Args:
            inspection_id: Inspection to assign
            pilot_id: Pilot user ID
        
        Returns:
            Updated Inspection object
        
        Raises:
            HTTPException: If inspection not found or already assigned
        """
        inspection = self.get_inspection(inspection_id)
        
        if inspection.status != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Inspection is already {inspection.status}"
            )
        
        inspection.pilot_id = pilot_id
        inspection.status = "scheduled"
        inspection.assigned_at = datetime.utcnow()  # Will be added to model
        
        self.db.commit()
        self.db.refresh(inspection)
        
        return inspection
    
    def update_status(self, inspection_id: int, new_status: str) -> Inspection:
        """
        Update inspection status
        
        Args:
            inspection_id: Inspection ID
            new_status: New status value
        
        Returns:
            Updated Inspection object
        """
        inspection = self.get_inspection(inspection_id)
        
        # Validate status transitions
        valid_statuses = ["pending", "scheduled", "completed", "cancelled"]
        if new_status not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )
        
        inspection.status = new_status
        
        if new_status == "completed":
            inspection.completed_at = datetime.utcnow()  # Will be added to model
        
        self.db.commit()
        self.db.refresh(inspection)
        
        return inspection
