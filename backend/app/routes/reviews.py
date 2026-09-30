from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.database import get_db
from app.models.review import ReviewCreate, ReviewInDB
from app.models.user import UserInDB
from app.auth import get_current_user

router = APIRouter(prefix="/reviews", tags=["Verified Student Reviews"])

@router.get("/hostel/{hostel_id}", response_model=List[ReviewInDB])
async def get_hostel_reviews(hostel_id: str):
    db = get_db()
    cursor = db.reviews.find({"hostel_id": hostel_id}).sort("created_at", -1)
    reviews_list = await cursor.to_list(length=50)
    return [ReviewInDB(**r) for r in reviews_list]

@router.post("", response_model=ReviewInDB, status_code=status.HTTP_201_CREATED)
async def create_review(
    payload: ReviewCreate,
    current_user: UserInDB = Depends(get_current_user)
):
    db = get_db()
    hostel = await db.hostels.find_one({"id": payload.hostel_id})
    if not hostel:
        raise HTTPException(status_code=404, detail="Hostel not found")

    review_id = f"rev-{int(datetime.utcnow().timestamp() * 1000)}"
    review_dict = {
        "id": review_id,
        "hostel_id": payload.hostel_id,
        "student_id": current_user.id,
        "student_name": current_user.full_name,
        "rating": payload.rating,
        "cleanliness_rating": payload.cleanliness_rating,
        "food_rating": payload.food_rating,
        "safety_rating": payload.safety_rating,
        "wifi_rating": payload.wifi_rating,
        "comment": payload.comment,
        "room_type_stayed": payload.room_type_stayed or "2-Sharing AC",
        "verified_resident": True,
        "created_at": datetime.utcnow(),
    }

    await db.reviews.insert_one(review_dict)

    # Recalculate hostel avg rating
    all_reviews_cursor = db.reviews.find({"hostel_id": payload.hostel_id})
    all_revs = await all_reviews_cursor.to_list(length=200)
    if all_revs:
        avg_score = round(sum(r["rating"] for r in all_revs) / len(all_revs), 1)
        await db.hostels.update_one(
            {"id": payload.hostel_id},
            {"$set": {
                "avg_rating": avg_score,
                "review_count": len(all_revs)
            }}
        )

    return ReviewInDB(**review_dict)
