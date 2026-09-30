from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.database import get_db
from app.models.university import UniversityInDB

router = APIRouter(prefix="/universities", tags=["Universities"])

@router.get("", response_model=List[UniversityInDB])
async def list_universities(city: Optional[str] = Query(None)):
    db = get_db()
    query = {}
    if city:
        query["city"] = {"$regex": f"^{city}$", "$options": "i"}

    cursor = db.universities.find(query)
    unis = await cursor.to_list(length=50)
    return [UniversityInDB(**u) for u in unis]

@router.get("/{slug}", response_model=UniversityInDB)
async def get_university_by_slug(slug: str):
    db = get_db()
    uni = await db.universities.find_one({"slug": slug})
    if not uni:
        raise HTTPException(status_code=404, detail="University not found")
    return UniversityInDB(**uni)
