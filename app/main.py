from typing import List
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import Base, engine, get_db
from app import models
from app.schemas import UserCreate, UserResponse, InspectionCreate, InspectionResponse, ReportCreate, ReportResponse
from app.auth import hash_password, verify_password, pwd_context
from app.models import User, Inspection, Report
from pydantic import BaseModel

# 1️⃣ Create FastAPI app
app = FastAPI(title="Drone Inspection Backend")

# Allow CORS for Frontend
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2️⃣ Create tables in DB
Base.metadata.create_all(bind=engine)

# 3️⃣ Test route
@app.get("/")
def root():
    return {"message": "Backend running successfully"}

# Login Schema
class LoginRequest(BaseModel):
    email: str
    password: str

# 4️⃣ Auth Routes
@app.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not verify_password(request.password, user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    return {"message": "Login successful", "user_id": user.id, "role": user.role}

@app.post("/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check if email exists
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password),
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

# 5️⃣ Inspection Routes
@app.post("/inspections", response_model=InspectionResponse)
def create_inspection(inspection: InspectionCreate, customer_id: int, db: Session = Depends(get_db)):
    new_inspection = Inspection(
        customer_id=customer_id,
        location=inspection.location,
        scheduled_date=inspection.scheduled_date,
        package=inspection.package,
        status="pending"
    )
    db.add(new_inspection)
    db.commit()
    db.refresh(new_inspection)
    return new_inspection

@app.get("/inspections", response_model=List[InspectionResponse])
def get_inspections(user_id: int, user_role: str, db: Session = Depends(get_db)):
    if user_role == "customer":
        return db.query(Inspection).filter(Inspection.customer_id == user_id).all()
    elif user_role == "pilot":
        # Pilots see pending inspections or assigned ones (simplified for now to show all pending)
        return db.query(Inspection).filter(Inspection.status == "pending").all()
    return []

# 6️⃣ Report Routes
@app.post("/reports", response_model=ReportResponse)
def create_report(report: ReportCreate, db: Session = Depends(get_db)):
    new_report = Report(
        inspection_id=report.inspection_id,
        title=report.title,
        summary=report.summary,
        defect_classification=report.defect_classification,
        image_url=report.image_url,
        confidence=report.confidence
    )
    # Update inspection status
    inspection = db.query(Inspection).filter(Inspection.id == report.inspection_id).first()
    if inspection:
        inspection.status = "completed"
    
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    return new_report

@app.get("/reports/{inspection_id}", response_model=ReportResponse)
def get_report(inspection_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.inspection_id == inspection_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

@app.get("/reports/customer/{customer_id}", response_model=List[ReportResponse])
def get_customer_reports(customer_id: int, db: Session = Depends(get_db)):
    # Join reports with inspections to filter by customer_id
    reports = db.query(Report).join(Inspection).filter(Inspection.customer_id == customer_id).all()
    return reports

# 7️⃣ Analytics Route (Customer)
@app.get("/analytics/{customer_id}")
def get_analytics(customer_id: int, db: Session = Depends(get_db)):
    total_inspections = db.query(Inspection).filter(Inspection.customer_id == customer_id).count()
    completed_inspections = db.query(Inspection).filter(Inspection.customer_id == customer_id, Inspection.status == "completed").count()
    # Placeholder cost saving calculation
    cost_saved = completed_inspections * 500  # Arbitrary $500 saved per inspection vs manual
    
    next_booking = db.query(Inspection).filter(
        Inspection.customer_id == customer_id, 
        Inspection.status == "pending"
    ).order_by(Inspection.scheduled_date.asc()).first()

    return {
        "total_inspections": total_inspections,
        "completed": completed_inspections,
        "cost_saved": cost_saved,
        "next_booking_date": next_booking.scheduled_date if next_booking else None
    }
