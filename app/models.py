from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)  # customer / pilot
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Inspection(Base):
    __tablename__ = "inspections"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    pilot_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(50), default="pending")  # pending, scheduled, completed, cancelled
    location = Column(String(200), nullable=False)
    scheduled_date = Column(DateTime(timezone=True), nullable=True)
    package = Column(String(50), default="Basic") # Basic, Advanced, Premium, Elite
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # New fields for async workflow
    assigned_at = Column(DateTime(timezone=True), nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    analysis_status = Column(String(50), default="not_started")  # not_started, processing, completed, failed
    raw_images_path = Column(String(500), nullable=True)  # Supabase Storage path
    processed_images_path = Column(String(500), nullable=True)
    
    # Relationships
    customer = relationship("User", foreign_keys=[customer_id])
    pilot = relationship("User", foreign_keys=[pilot_id])

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    inspection_id = Column(Integer, ForeignKey("inspections.id", ondelete="CASCADE"), unique=True, nullable=False)
    title = Column(String(200), nullable=False)
    summary = Column(String(500), nullable=True)
    defect_classification = Column(String(100), nullable=True) # e.g. "Crack", "Hotspot"
    image_url = Column(String(500), nullable=True) # URL to defect image
    confidence = Column(Integer, nullable=True) # Confidence % (0-100)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    inspection = relationship("Inspection")
