from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum
from datetime import datetime

class AlertSeverity(str, Enum):
    INFO = "info"
    SUCCESS = "success"
    WARNING = "warning"
    CRITICAL = "critical"

class JourneyAlert(BaseModel):
    id: str
    title: str
    message: str
    severity: AlertSeverity
    pillar: str # "accommodation" | "logistics" | "essentials" | "timeline"
    action_text: Optional[str] = None
    action_link: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Milestone(BaseModel):
    key: str
    label: str
    description: str
    pillar: str
    status: str # "completed", "in_progress", "pending", "risk"
    completed_at: Optional[str] = None
    detail: Optional[str] = None

class ReadinessBreakdown(BaseModel):
    accommodation_score: float = 0.0 # max 35
    logistics_score: float = 0.0     # max 25
    essentials_score: float = 0.0    # max 20
    timeline_risk_score: float = 0.0 # max 20
    total_score: int = 0             # 0 to 100
    status_tier: str = "Critical Risk" # "On Track", "Needs Attention", "Critical Risk"
    days_until_move_in: int = 0
    summary_headline: str = "Relocation setup pending initialization"

class RelocationJourneyInDB(BaseModel):
    id: str
    student_id: str
    student_name: str
    student_email: str
    student_phone: Optional[str] = None
    target_university: str
    target_city: str
    origin_city: str
    move_in_date: str # YYYY-MM-DD
    # Linked resources
    booking_id: Optional[str] = None
    hostel_id: Optional[str] = None
    hostel_name: Optional[str] = None
    hostel_verified: bool = False
    booking_status: str = "not_started" # "not_started", "pending", "confirmed", "rejected"
    logistics_order_id: Optional[str] = None
    logistics_status: str = "not_started" # "not_started", "booked", "pickup_scheduled", "in_transit", "delivered"
    logistics_eta: Optional[str] = None
    essentials_order_id: Optional[str] = None
    essentials_status: str = "not_started" # "not_started", "confirmed", "packed", "dispatched", "delivered_to_room"
    essentials_eta: Optional[str] = None
    # Readiness engine computed fields
    readiness: ReadinessBreakdown = Field(default_factory=ReadinessBreakdown)
    milestones: List[Milestone] = Field(default_factory=list)
    alerts: List[JourneyAlert] = Field(default_factory=list)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
