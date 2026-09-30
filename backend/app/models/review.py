from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ReviewCreate(BaseModel):
    hostel_id: str
    rating: int = Field(ge=1, le=5)
    cleanliness_rating: int = Field(ge=1, le=5)
    food_rating: int = Field(ge=1, le=5)
    safety_rating: int = Field(ge=1, le=5)
    wifi_rating: int = Field(ge=1, le=5)
    comment: str
    room_type_stayed: Optional[str] = "2-Sharing AC"

class ReviewInDB(BaseModel):
    id: str
    hostel_id: str
    student_id: str
    student_name: str
    rating: int
    cleanliness_rating: int
    food_rating: int
    safety_rating: int
    wifi_rating: int
    comment: str
    room_type_stayed: str
    verified_resident: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
