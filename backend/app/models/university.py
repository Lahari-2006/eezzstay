from pydantic import BaseModel, Field
from typing import Optional, List

class UniversityBase(BaseModel):
    name: str
    short_name: str
    slug: str
    city: str
    state: str
    address: str
    student_population: int
    popular_majors: List[str] = Field(default_factory=list)
    image_url: Optional[str] = None
    featured: bool = True

class UniversityInDB(UniversityBase):
    id: str
    verified_hostel_count: int = 0
    recommended_hostel_ids: List[str] = Field(default_factory=list)
