from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str  # customer or pilot

from datetime import datetime
from typing import Optional

class UserResponse(UserCreate):
    id: int
    created_at: datetime

    model_config = {
        "from_attributes": True
    }

class InspectionCreate(BaseModel):
    location: str
    scheduled_date: datetime
    package: str = "Basic" # Added package selection

class InspectionResponse(InspectionCreate):
    id: int
    customer_id: int
    pilot_id: Optional[int]
    status: str
    created_at: datetime
    package: str

    model_config = {
        "from_attributes": True
    }

class ReportCreate(BaseModel):
    inspection_id: int
    title: str
    summary: Optional[str]
    defect_classification: Optional[str]
    image_url: Optional[str] = None
    confidence: Optional[int] = None

class ReportResponse(ReportCreate):
    id: int
    created_at: datetime

    model_config = {
        "from_attributes": True
    }
