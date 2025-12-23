from fastapi import APIRouter, Depends, Query, status, File, UploadFile, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.schemas import InspectionCreate, InspectionResponse
from app.services.inspection_service import InspectionService
from app.services.storage_service import StorageService
from app.middleware.auth_middleware import get_current_user, require_role

router = APIRouter()

@router.post("", response_model=InspectionResponse, status_code=status.HTTP_201_CREATED)
def create_inspection(
    inspection: InspectionCreate,
    current_user: dict = Depends(require_role(["customer"])),
    db: Session = Depends(get_db)
):
    """
    Create a new inspection (customers only)
    
    Customers can request a new drone inspection by providing:
    - Location to inspect
    - Scheduled date
    - Package tier (Basic, Advanced, Premium, Elite)
    """
    service = InspectionService(db)
    return service.create_inspection(
        customer_id=current_user["user_id"],
        data=inspection
    )

@router.get("", response_model=List[InspectionResponse])
def list_inspections(
    status: Optional[str] = Query(None, description="Filter by status (pending, scheduled, completed)"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List inspections (role-filtered)
    
    - Customers see only their own inspections
    - Pilots see pending inspections and ones assigned to them
    """
    service = InspectionService(db)
    return service.list_inspections(
        user_id=current_user["user_id"],
        role=current_user["role"],
        status_filter=status
    )

@router.get("/{inspection_id}", response_model=InspectionResponse)
def get_inspection(
    inspection_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific inspection by ID
    
    Access control:
    - Customers can only view their own inspections
    - Pilots can view assigned inspections or pending ones
    """
    service = InspectionService(db)
    inspection = service.get_inspection(inspection_id)
    
    # Authorization check
    role = current_user["role"]
    user_id = current_user["user_id"]
    
    if role == "customer" and inspection.customer_id != user_id:
        from fastapi import HTTPException
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your inspection")
    
    if role == "pilot" and inspection.pilot_id != user_id and inspection.status != "pending":
        from fastapi import HTTPException
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not assigned to you")
    
    return inspection

@router.patch("/{inspection_id}/assign", response_model=InspectionResponse)
def assign_pilot_to_inspection(
    inspection_id: int,
    current_user: dict = Depends(require_role(["pilot"])),
    db: Session = Depends(get_db)
):
    """
    Pilot accepts/assigns themselves to an inspection
    
    Only pilots can call this endpoint.
    Inspection must be in 'pending' status.
    """
    service = InspectionService(db)
    return service.assign_pilot(
        inspection_id=inspection_id,
        pilot_id=current_user["user_id"]
    )

@router.patch("/{inspection_id}/status")
def update_inspection_status(
    inspection_id: int,
    new_status: str = Query(..., description="New status (pending, scheduled, completed, cancelled)"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update inspection status
    
    Authorization:
    - Customers can cancel their own inspections
    - Pilots can update status of assigned inspections
    """
    service = InspectionService(db)
    inspection = service.get_inspection(inspection_id)
    
    # Authorization
    role = current_user["role"]
    user_id = current_user["user_id"]
    
    if role == "customer":
        if inspection.customer_id != user_id:
            from fastapi import HTTPException
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your inspection")
        if new_status not in ["cancelled"]:
            from fastapi import HTTPException
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Customers can only cancel")
    
    if role == "pilot":
        if inspection.pilot_id != user_id:
            from fastapi import HTTPException
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not assigned to you")
    
    return service.update_status(inspection_id, new_status)

@router.post("/{inspection_id}/upload")
async def upload_inspection_images(
    inspection_id: int,
    files: List[UploadFile] = File(...),
    current_user: dict = Depends(require_role(["pilot"])),
    db: Session = Depends(get_db)
):
    """
    Upload drone images for analysis (Pilots only)
    
    1. Uploads images to Supabase Storage
    2. Updates inspection metadata (paths and timestamps)
    3. Sets analysis_status to 'processing'
    """
    inspection_service = InspectionService(db)
    storage_service = StorageService()
    
    # 1. Verify inspection and ownership
    inspection = inspection_service.get_inspection(inspection_id)
    if inspection.pilot_id != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="You are not assigned to this inspection"
        )
        
    # 2. Upload to storage
    result = await storage_service.upload_inspection_images(inspection_id, files)
    
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
        
    # 3. Update inspection record
    inspection.raw_images_path = result["folder"]
    inspection.analysis_status = "processing"
    inspection.started_at = datetime.utcnow()
    
    db.commit()
    db.refresh(inspection)
    
    # TODO: Trigger background analysis job
    
    return {
        "message": "Images uploaded successfully",
        "file_count": len(files),
        "analysis_status": inspection.analysis_status
    }
