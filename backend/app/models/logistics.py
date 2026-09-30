from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum
from datetime import datetime

class PackageType(str, Enum):
    BOX_SMALL = "box_small" # Books, documents, clothes (Up to 15kg)
    BOX_MEDIUM = "box_medium" # Wardrobe, shoes, study gear (Up to 30kg)
    BOX_LARGE = "box_large" # Heavy luggage, mattress topper, appliances (Up to 50kg)
    FULL_DORM_KIT = "full_dorm_kit" # Complete relocation 3-4 heavy cartons
    CUSTOM = "custom"

class LogisticsStatus(str, Enum):
    BOOKED = "booked"
    PICKUP_SCHEDULED = "pickup_scheduled"
    PICKED_UP = "picked_up"
    IN_TRANSIT = "in_transit"
    OUT_FOR_DELIVERY = "out_for_delivery"
    DELIVERED = "delivered"
    DELAYED = "delayed"

class LogisticsItem(BaseModel):
    package_type: PackageType
    label: str
    weight_kg: float
    quantity: int = 1

class LogisticsQuoteRequest(BaseModel):
    origin_city: str
    destination_city: str
    destination_hostel_id: Optional[str] = None
    packages: List[LogisticsItem]
    pickup_date: str # YYYY-MM-DD
    is_express: bool = False

class LogisticsQuoteResponse(BaseModel):
    estimated_cost_inr: int
    estimated_transit_days: int
    estimated_delivery_date: str
    origin_hub: str
    destination_hub: str
    distance_km: int

class LogisticsOrderCreate(BaseModel):
    origin_city: str
    origin_address: str
    origin_pincode: str
    destination_city: str
    destination_hostel_id: Optional[str] = None
    destination_address: str
    destination_pincode: str
    packages: List[LogisticsItem]
    pickup_date: str # YYYY-MM-DD
    is_express: bool = False
    recipient_phone: str
    special_instructions: Optional[str] = None

class TrackingCheckpoint(BaseModel):
    status: LogisticsStatus
    location: str
    description: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class LogisticsOrderInDB(BaseModel):
    id: str
    tracking_number: str # e.g. EZL-HYD-99824
    student_id: str
    student_name: str
    student_phone: str
    origin_city: str
    origin_address: str
    origin_pincode: str
    destination_city: str
    destination_hostel_id: Optional[str] = None
    destination_hostel_name: Optional[str] = None
    destination_address: str
    destination_pincode: str
    packages: List[LogisticsItem]
    total_weight_kg: float
    pickup_date: str
    estimated_delivery_date: str
    actual_delivery_date: Optional[str] = None
    is_express: bool = False
    total_cost_inr: int
    status: LogisticsStatus = LogisticsStatus.BOOKED
    checkpoints: List[TrackingCheckpoint] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
