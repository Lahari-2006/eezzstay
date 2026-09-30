from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from enum import Enum
from datetime import datetime

class UserRole(str, Enum):
    STUDENT = "student"
    PARENT = "parent"
    HOSTEL_OWNER = "hostel_owner"
    ADMIN = "admin"

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    role: UserRole = UserRole.STUDENT
    city: Optional[str] = "Hyderabad"
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    password: str
    target_university: Optional[str] = None
    target_city: Optional[str] = None
    move_in_date: Optional[str] = None
    origin_city: Optional[str] = None
    # For parents:
    student_link_code: Optional[str] = None
    # For hostel owners:
    business_name: Optional[str] = None
    gst_number: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserInDB(UserBase):
    id: str
    hashed_password: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    # Student specific
    target_university: Optional[str] = None
    target_city: Optional[str] = None
    move_in_date: Optional[str] = None
    origin_city: Optional[str] = None
    linked_parent_id: Optional[str] = None
    student_link_code: Optional[str] = None # 6-digit code for parents to link
    # Parent specific
    linked_student_id: Optional[str] = None
    linked_student_name: Optional[str] = None
    # Hostel owner specific
    business_name: Optional[str] = None
    gst_number: Optional[str] = None
    owned_hostel_ids: List[str] = Field(default_factory=list)

class UserPublic(UserBase):
    id: str
    is_active: bool
    created_at: datetime
    target_university: Optional[str] = None
    target_city: Optional[str] = None
    move_in_date: Optional[str] = None
    origin_city: Optional[str] = None
    linked_parent_id: Optional[str] = None
    student_link_code: Optional[str] = None
    linked_student_id: Optional[str] = None
    linked_student_name: Optional[str] = None
    business_name: Optional[str] = None
    gst_number: Optional[str] = None
    owned_hostel_ids: List[str] = Field(default_factory=list)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic

class ParentLinkRequest(BaseModel):
    student_link_code: str
