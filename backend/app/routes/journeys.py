from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from app.database import get_db
from app.models.journey import RelocationJourneyInDB, JourneyAlert
from app.models.user import UserInDB, UserRole
from app.models.hostel import VerificationStatus
from app.auth import get_current_user
from app.services.readiness_score import calculate_readiness

router = APIRouter(prefix="/journeys", tags=["Relocation Command Center & Journey"])

@router.get("/my-journey", response_model=RelocationJourneyInDB)
async def get_my_journey(current_user: UserInDB = Depends(get_current_user)):
    db = get_db()
    target_student_id = current_user.id

    if current_user.role == UserRole.PARENT:
        if not current_user.linked_student_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No student profile is linked to this parent account. Please link using the student's 6-digit link code."
            )
        target_student_id = current_user.linked_student_id

    journey = await db.journeys.find_one({"student_id": target_student_id})
    if not journey:
        # Create a fresh journey if missing
        student_doc = await db.users.find_one({"id": target_student_id})
        if not student_doc:
            raise HTTPException(status_code=404, detail="Student user not found")

        breakdown, milestones, alerts = calculate_readiness(
            target_university=student_doc.get("target_university", "KL University Hyderabad"),
            target_city=student_doc.get("target_city", "Hyderabad"),
            move_in_date_str=student_doc.get("move_in_date", ""),
            booking_data={"status": "not_started"},
            logistics_data={"status": "not_started"},
            essentials_data={"status": "not_started"},
        )
        journey = {
            "id": f"jrn-{target_student_id}",
            "student_id": target_student_id,
            "student_name": student_doc.get("full_name", "Student"),
            "student_email": student_doc.get("email", ""),
            "student_phone": student_doc.get("phone", ""),
            "target_university": student_doc.get("target_university", "KL University Hyderabad"),
            "target_city": student_doc.get("target_city", "Hyderabad"),
            "origin_city": student_doc.get("origin_city", "Visakhapatnam"),
            "move_in_date": student_doc.get("move_in_date", ""),
            "booking_id": None,
            "hostel_id": None,
            "hostel_name": None,
            "hostel_verified": False,
            "booking_status": "not_started",
            "logistics_order_id": None,
            "logistics_status": "not_started",
            "logistics_eta": None,
            "essentials_order_id": None,
            "essentials_status": "not_started",
            "essentials_eta": None,
            "readiness": breakdown.model_dump(),
            "milestones": [m.model_dump() for m in milestones],
            "alerts": [a.model_dump() for a in alerts],
            "updated_at": datetime.utcnow(),
        }
        await db.journeys.insert_one(journey)
    else:
        # Dynamically ensure calculation is fresh with latest DB state
        booking = await db.bookings.find_one({"student_id": target_student_id})
        logistics = await db.logistics.find_one({"student_id": target_student_id})
        essentials = await db.essentials_orders.find_one({"student_id": target_student_id})
        hostel = None
        if booking and booking.get("hostel_id"):
            hostel = await db.hostels.find_one({"id": booking["hostel_id"]})

        booking_ctx = {
            "status": booking.get("status") if booking else "not_started",
            "hostel_verified": (hostel.get("verification_status") == VerificationStatus.VERIFIED) if hostel else False,
            "hostel_name": booking.get("hostel_name") if booking else "Hostel",
            "confirmed_at": booking.get("confirmed_at") if booking else None
        }
        logistics_ctx = {
            "status": logistics.get("status") if logistics else "not_started",
            "tracking_number": logistics.get("tracking_number") if logistics else None,
            "estimated_delivery_date": logistics.get("estimated_delivery_date") if logistics else None,
            "created_at": logistics.get("created_at") if logistics else None,
        }
        essentials_ctx = {
            "status": essentials.get("status") if essentials else "not_started",
            "order_reference": essentials.get("order_reference") if essentials else None,
            "created_at": essentials.get("created_at") if essentials else None,
        }

        breakdown, milestones, alerts = calculate_readiness(
            target_university=journey.get("target_university", "University"),
            target_city=journey.get("target_city", "Hyderabad"),
            move_in_date_str=journey.get("move_in_date", ""),
            booking_data=booking_ctx,
            logistics_data=logistics_ctx,
            essentials_data=essentials_ctx,
        )

        journey["readiness"] = breakdown.model_dump()
        journey["milestones"] = [m.model_dump() for m in milestones]
        journey["alerts"] = [a.model_dump() for a in alerts]
        journey["updated_at"] = datetime.utcnow()

        await db.journeys.update_one(
            {"student_id": target_student_id},
            {"$set": {
                "readiness": journey["readiness"],
                "milestones": journey["milestones"],
                "alerts": journey["alerts"],
                "updated_at": datetime.utcnow(),
            }}
        )

    return RelocationJourneyInDB(**journey)

@router.get("/alerts", response_model=List[JourneyAlert])
async def get_my_alerts(current_user: UserInDB = Depends(get_current_user)):
    target_student_id = current_user.id
    if current_user.role == UserRole.PARENT and current_user.linked_student_id:
        target_student_id = current_user.linked_student_id

    db = get_db()
    journey = await db.journeys.find_one({"student_id": target_student_id})
    if not journey:
        return []

    return [JourneyAlert(**a) for a in journey.get("alerts", [])]
