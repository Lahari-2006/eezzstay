from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.database import get_db
from app.models.hostel import (
    HostelInDB,
    HostelCreate,
    HostelUpdate,
    HostelDocument,
    VerificationStatus,
    GenderType,
    DocumentType,
)
from app.models.user import UserInDB, UserRole
from app.auth import get_current_user, require_roles

router = APIRouter(prefix="/hostels", tags=["Hostels"])

@router.get("", response_model=List[HostelInDB])
async def list_hostels(
    city: Optional[str] = Query(None, description="City name (e.g. Hyderabad, Bengaluru, Pune)"),
    gender_type: Optional[GenderType] = Query(None, description="Boys, Girls, Co-ed"),
    verified_only: Optional[bool] = Query(False, description="Filter only verified hostels"),
    university: Optional[str] = Query(None, description="Nearby university name"),
    max_price: Optional[int] = Query(None, description="Maximum monthly rent"),
    search: Optional[str] = Query(None, description="Search term in name, locality, or description"),
):
    db = get_db()
    query = {}

    if city:
        query["city"] = {"$regex": f"^{city}$", "$options": "i"}

    if gender_type:
        query["gender_type"] = gender_type.value

    if verified_only:
        query["verification_status"] = VerificationStatus.VERIFIED.value

    if university:
        query["nearby_universities.university_name"] = {"$regex": university, "$options": "i"}

    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"locality": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"amenities": {"$regex": search, "$options": "i"}},
        ]

    cursor = db.hostels.find(query).sort("trust_score", -1)
    hostels_list = await cursor.to_list(length=100)

    # Post-filter for max_price across room options if specified
    if max_price:
        filtered = []
        for h in hostels_list:
            room_prices = [r.get("price_monthly", 999999) for r in h.get("room_options", [])]
            if room_prices and min(room_prices) <= max_price:
                filtered.append(h)
        return [HostelInDB(**h) for h in filtered]

    return [HostelInDB(**h) for h in hostels_list]

@router.get("/owner/my-listings", response_model=List[HostelInDB])
async def get_my_hostels(
    current_user: UserInDB = Depends(require_roles([UserRole.HOSTEL_OWNER, UserRole.ADMIN]))
):
    db = get_db()
    if current_user.role == UserRole.ADMIN:
        cursor = db.hostels.find()
    else:
        cursor = db.hostels.find({"owner_id": current_user.id})
    hostels_list = await cursor.to_list(length=100)
    return [HostelInDB(**h) for h in hostels_list]

@router.get("/{hostel_id}", response_model=HostelInDB)
async def get_hostel_details(hostel_id: str):
    db = get_db()
    hostel = await db.hostels.find_one({"id": hostel_id})
    if not hostel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hostel not found"
        )
    return HostelInDB(**hostel)

@router.post("", response_model=HostelInDB, status_code=status.HTTP_201_CREATED)
async def create_hostel(
    payload: HostelCreate,
    current_user: UserInDB = Depends(require_roles([UserRole.HOSTEL_OWNER, UserRole.ADMIN]))
):
    db = get_db()
    hostel_id = f"hst-{int(datetime.utcnow().timestamp() * 1000)}"

    hostel_dict = payload.model_dump()
    hostel_dict.update({
        "id": hostel_id,
        "owner_id": current_user.id,
        "owner_name": current_user.full_name,
        "verification_status": VerificationStatus.PENDING,
        "trust_score": 65, # Base starting trust score for new PG
        "trust_breakdown": {
            "physical_inspection": 0,
            "fire_safety_clearance": 50,
            "police_verification": 50,
            "food_hygiene_fssai": 50,
            "student_feedback_rating": 80
        },
        "avg_rating": 5.0,
        "review_count": 0,
        "created_at": datetime.utcnow(),
    })

    await db.hostels.insert_one(hostel_dict)

    # Add to owner's owned list
    await db.users.update_one(
        {"id": current_user.id},
        {"$addToSet": {"owned_hostel_ids": hostel_id}}
    )

    return HostelInDB(**hostel_dict)

@router.put("/{hostel_id}", response_model=HostelInDB)
async def update_hostel(
    hostel_id: str,
    payload: HostelUpdate,
    current_user: UserInDB = Depends(require_roles([UserRole.HOSTEL_OWNER, UserRole.ADMIN]))
):
    db = get_db()
    hostel = await db.hostels.find_one({"id": hostel_id})
    if not hostel:
        raise HTTPException(status_code=404, detail="Hostel not found")

    if current_user.role != UserRole.ADMIN and hostel["owner_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have permission to edit this hostel.")

    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    if update_data:
        await db.hostels.update_one({"id": hostel_id}, {"$set": update_data})

    updated_hostel = await db.hostels.find_one({"id": hostel_id})
    return HostelInDB(**updated_hostel)

@router.post("/{hostel_id}/documents", response_model=HostelInDB)
async def upload_hostel_document(
    hostel_id: str,
    doc_type: DocumentType,
    title: str,
    file_url: Optional[str] = None,
    notes: Optional[str] = None,
    current_user: UserInDB = Depends(require_roles([UserRole.HOSTEL_OWNER, UserRole.ADMIN]))
):
    db = get_db()
    hostel = await db.hostels.find_one({"id": hostel_id})
    if not hostel:
        raise HTTPException(status_code=404, detail="Hostel not found")

    if current_user.role != UserRole.ADMIN and hostel["owner_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized.")

    new_doc = HostelDocument(
        id=f"doc-{int(datetime.utcnow().timestamp() * 1000)}",
        doc_type=doc_type,
        title=title,
        file_url=file_url or f"https://docs.ezeestayy.com/mock/{doc_type.value}_{hostel_id}.pdf",
        status=VerificationStatus.PENDING,
        notes=notes or "Submitted for administrative review",
    )

    await db.hostels.update_one(
        {"id": hostel_id},
        {
            "$push": {"documents": new_doc.model_dump()},
            "$set": {"verification_status": VerificationStatus.PENDING}
        }
    )

    updated_hostel = await db.hostels.find_one({"id": hostel_id})
    return HostelInDB(**updated_hostel)
