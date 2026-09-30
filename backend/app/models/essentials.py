from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum
from datetime import datetime

class EssentialsCategory(str, Enum):
    BUNDLE = "bundle"
    BEDDING_BATH = "bedding_bath"
    STUDY_TECH = "study_tech"
    KITCHENETTE = "kitchenette"
    HYGIENE_CLEANING = "hygiene_cleaning"

class EssentialsOrderStatus(str, Enum):
    CONFIRMED = "confirmed"
    PACKED = "packed"
    DISPATCHED = "dispatched"
    DELIVERED_TO_ROOM = "delivered_to_room"
    CANCELLED = "cancelled"

class EssentialsItem(BaseModel):
    id: str
    name: str
    description: str
    category: EssentialsCategory
    price_inr: int
    original_price_inr: int
    image_url: str
    in_stock: bool = True
    rating: float = 4.8
    features: List[str] = Field(default_factory=list)

class EssentialsBundle(BaseModel):
    id: str
    title: str
    subtitle: str
    category: EssentialsCategory = EssentialsCategory.BUNDLE
    price_inr: int
    original_price_inr: int
    savings_inr: int
    badge: str # "Most Popular", "Dorm Essential", "Best Value"
    image_url: str
    items_included: List[str]
    description: str

class OrderLineItem(BaseModel):
    item_id: str
    item_type: str # "bundle" or "item"
    title: str
    price_inr: int
    quantity: int = 1

class EssentialsOrderCreate(BaseModel):
    items: List[OrderLineItem]
    delivery_address: str
    delivery_city: str
    destination_hostel_id: Optional[str] = None
    scheduled_delivery_date: str # YYYY-MM-DD (typically move_in_date)
    contact_phone: str
    special_notes: Optional[str] = None

class EssentialsOrderInDB(BaseModel):
    id: str
    order_reference: str # e.g. EZK-2026-4421
    student_id: str
    student_name: str
    items: List[OrderLineItem]
    total_amount_inr: int
    delivery_address: str
    delivery_city: str
    destination_hostel_id: Optional[str] = None
    scheduled_delivery_date: str
    status: EssentialsOrderStatus = EssentialsOrderStatus.CONFIRMED
    contact_phone: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
