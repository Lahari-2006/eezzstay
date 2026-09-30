from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum
from datetime import datetime

class GenderType(str, Enum):
    BOYS = "Boys"
    GIRLS = "Girls"
    CO_ED = "Co-ed"

class VerificationStatus(str, Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"

class DocumentType(str, Enum):
    TRADE_LICENSE = "trade_license"
    FIRE_SAFETY = "fire_safety_noc"
    POLICE_VERIFICATION = "police_verification"
    OWNERSHIP_LEASE = "ownership_lease_agreement"
    FOOD_SAFETY_FSSAI = "fssai_license"

class HostelDocument(BaseModel):
    id: str = Field(default_factory=lambda: datetime.utcnow().strftime("%Y%m%d%H%M%S"))
    doc_type: DocumentType
    title: str
    file_url: str
    status: VerificationStatus = VerificationStatus.PENDING
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    verified_at: Optional[datetime] = None
    notes: Optional[str] = None

class RoomOption(BaseModel):
    room_type: str # "Single Room", "2-Sharing AC", "3-Sharing Non-AC", "4-Sharing"
    price_monthly: int
    security_deposit: int
    available_beds: int
    total_beds: int
    attached_bathroom: bool = True
    ac_available: bool = True

class NearbyUniversity(BaseModel):
    university_name: str
    distance_km: float
    transit_mins: int

class HostelBase(BaseModel):
    name: str
    description: str
    city: str
    locality: str
    address: str
    gender_type: GenderType = GenderType.CO_ED
    nearby_universities: List[NearbyUniversity] = Field(default_factory=list)
    amenities: List[str] = Field(default_factory=list)
    room_options: List[RoomOption] = Field(default_factory=list)
    rules: List[str] = Field(default_factory=list)
    food_included: bool = True
    food_type: str = "North & South Indian Veg + Non-Veg (2x/wk)"
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    cover_image: Optional[str] = None
    images: List[str] = Field(default_factory=list)

class HostelCreate(HostelBase):
    documents: List[HostelDocument] = Field(default_factory=list)

class HostelUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    city: Optional[str] = None
    locality: Optional[str] = None
    address: Optional[str] = None
    gender_type: Optional[GenderType] = None
    nearby_universities: Optional[List[NearbyUniversity]] = None
    amenities: Optional[List[str]] = None
    room_options: Optional[List[RoomOption]] = None
    rules: Optional[List[str]] = None
    food_included: Optional[bool] = None
    food_type: Optional[str] = None
    contact_phone: Optional[str] = None
    cover_image: Optional[str] = None
    images: Optional[List[str]] = None

class HostelInDB(HostelBase):
    id: str
    owner_id: str
    owner_name: str
    verification_status: VerificationStatus = VerificationStatus.PENDING
    trust_score: int = 75 # 0-100
    trust_breakdown: Dict[str, Any] = Field(default_factory=dict)
    documents: List[HostelDocument] = Field(default_factory=list)
    avg_rating: float = 4.5
    review_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class HostelVerificationAction(BaseModel):
    status: VerificationStatus
    audit_notes: Optional[str] = None
    trust_score: Optional[int] = None
