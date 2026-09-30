from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum
from datetime import datetime

class BookingStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    REJECTED = "rejected"
    CANCELLED = "cancelled"

class BookingCreate(BaseModel):
    hostel_id: str
    room_type: str
    move_in_date: str # YYYY-MM-DD
    duration_months: int = 6
    special_requests: Optional[str] = None

class BookingStatusUpdate(BaseModel):
    status: BookingStatus
    response_notes: Optional[str] = None

class BookingInDB(BaseModel):
    id: str
    booking_reference: str
    student_id: str
    student_name: str
    student_email: str
    student_phone: Optional[str] = None
    hostel_id: str
    hostel_name: str
    hostel_city: str
    hostel_locality: str
    hostel_address: str
    owner_id: str
    room_type: str
    monthly_rent: int
    security_deposit: int
    move_in_date: str
    duration_months: int = 6
    status: BookingStatus = BookingStatus.PENDING
    special_requests: Optional[str] = None
    response_notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    confirmed_at: Optional[datetime] = None
