import random
import string
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.database import get_db
from app.models.booking import (
    BookingCreate,
    BookingInDB,
    BookingStatus,
    BookingStatusUpdate,
)
from app.models.user import UserInDB, UserRole
from app.models.hostel import VerificationStatus
from app.auth import get_current_user, require_roles
from app.services.readiness_score import calculate_readiness

router = APIRouter(prefix="/bookings", tags=["Bookings"])

@router.post("", response_model=BookingInDB, status_code=status.HTTP_201_CREATED)
async def create_booking(
    payload: BookingCreate,
    current_user: UserInDB = Depends(get_current_user)
):
    db = get_db()
    hostel = await db.hostels.find_one({"id": payload.hostel_id})
    if not hostel:
        raise HTTPException(status_code=404, detail="Selected hostel does not exist")

    # Match room option
    selected_room = None
    for r in hostel.get("room_options", []):
        if r.get("room_type") == payload.room_type:
            selected_room = r
            break

    monthly_rent = selected_room["price_monthly"] if selected_room else 12000
    security_deposit = selected_room["security_deposit"] if selected_room else monthly_rent

    ref_code = "EZB-2026-" + "".join(random.choices(string.digits, k=4))
    booking_id = f"bk-{int(datetime.utcnow().timestamp() * 1000)}"

    booking_dict = {
        "id": booking_id,
        "booking_reference": ref_code,
        "student_id": current_user.id,
        "student_name": current_user.full_name,
        "student_email": current_user.email,
        "student_phone": current_user.phone,
        "hostel_id": hostel["id"],
        "hostel_name": hostel["name"],
        "hostel_city": hostel["city"],
        "hostel_locality": hostel.get("locality", ""),
        "hostel_address": hostel.get("address", ""),
        "owner_id": hostel["owner_id"],
        "room_type": payload.room_type,
        "monthly_rent": monthly_rent,
        "security_deposit": security_deposit,
        "move_in_date": payload.move_in_date,
        "duration_months": payload.duration_months,
        "status": BookingStatus.PENDING,
        "special_requests": payload.special_requests,
        "response_notes": None,
        "created_at": datetime.utcnow(),
        "confirmed_at": None,
    }

    await db.bookings.insert_one(booking_dict)

    # Sync and recalculate student's relocation journey
    journey = await db.journeys.find_one({"student_id": current_user.id})
    if journey:
        logistics = await db.logistics.find_one({"student_id": current_user.id})
        essentials = await db.essentials_orders.find_one({"student_id": current_user.id})

        booking_ctx = {
            "status": "pending",
            "hostel_verified": hostel.get("verification_status") == VerificationStatus.VERIFIED,
            "hostel_name": hostel["name"],
            "confirmed_at": None
        }
        logistics_ctx = {
            "status": logistics.get("status") if logistics else "not_started",
            "tracking_number": logistics.get("tracking_number") if logistics else None,
            "estimated_delivery_date": logistics.get("estimated_delivery_date") if logistics else None,
        }
        essentials_ctx = {
            "status": essentials.get("status") if essentials else "not_started",
            "order_reference": essentials.get("order_reference") if essentials else None,
        }

        breakdown, milestones, alerts = calculate_readiness(
            target_university=journey.get("target_university", "University"),
            target_city=hostel["city"],
            move_in_date_str=payload.move_in_date,
            booking_data=booking_ctx,
            logistics_data=logistics_ctx,
            essentials_data=essentials_ctx,
        )

        await db.journeys.update_one(
            {"student_id": current_user.id},
            {"$set": {
                "booking_id": booking_id,
                "hostel_id": hostel["id"],
                "hostel_name": hostel["name"],
                "hostel_verified": hostel.get("verification_status") == VerificationStatus.VERIFIED,
                "booking_status": "pending",
                "move_in_date": payload.move_in_date,
                "readiness": breakdown.model_dump(),
                "milestones": [m.model_dump() for m in milestones],
                "alerts": [a.model_dump() for a in alerts],
                "updated_at": datetime.utcnow(),
            }}
        )

    return BookingInDB(**booking_dict)

@router.get("/my-bookings", response_model=List[BookingInDB])
async def get_my_bookings(current_user: UserInDB = Depends(get_current_user)):
    db = get_db()
    # If parent, get student's bookings
    target_id = current_user.id
    if current_user.role == UserRole.PARENT and current_user.linked_student_id:
        target_id = current_user.linked_student_id

    cursor = db.bookings.find({"student_id": target_id}).sort("created_at", -1)
    bookings_list = await cursor.to_list(length=50)
    return [BookingInDB(**b) for b in bookings_list]

@router.get("/owner-requests", response_model=List[BookingInDB])
async def get_owner_booking_requests(
    current_user: UserInDB = Depends(require_roles([UserRole.HOSTEL_OWNER, UserRole.ADMIN]))
):
    db = get_db()
    if current_user.role == UserRole.ADMIN:
        cursor = db.bookings.find().sort("created_at", -1)
    else:
        cursor = db.bookings.find({"owner_id": current_user.id}).sort("created_at", -1)

    bookings_list = await cursor.to_list(length=100)
    return [BookingInDB(**b) for b in bookings_list]

@router.put("/{booking_id}/status", response_model=BookingInDB)
async def update_booking_status(
    booking_id: str,
    payload: BookingStatusUpdate,
    current_user: UserInDB = Depends(require_roles([UserRole.HOSTEL_OWNER, UserRole.ADMIN]))
):
    db = get_db()
    booking = await db.bookings.find_one({"id": booking_id})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if current_user.role != UserRole.ADMIN and booking["owner_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized.")

    confirmed_at = datetime.utcnow() if payload.status == BookingStatus.CONFIRMED else None

    await db.bookings.update_one(
        {"id": booking_id},
        {"$set": {
            "status": payload.status.value,
            "response_notes": payload.response_notes,
            "confirmed_at": confirmed_at,
        }}
    )

    updated_booking = await db.bookings.find_one({"id": booking_id})

    # Recalculate student journey readiness
    student_id = booking["student_id"]
    journey = await db.journeys.find_one({"student_id": student_id})
    if journey:
        hostel = await db.hostels.find_one({"id": booking["hostel_id"]})
        logistics = await db.logistics.find_one({"student_id": student_id})
        essentials = await db.essentials_orders.find_one({"student_id": student_id})

        booking_ctx = {
            "status": payload.status.value,
            "hostel_verified": (hostel.get("verification_status") == VerificationStatus.VERIFIED) if hostel else False,
            "hostel_name": booking["hostel_name"],
            "confirmed_at": confirmed_at.strftime("%Y-%m-%d") if confirmed_at else None
        }
        logistics_ctx = {
            "status": logistics.get("status") if logistics else "not_started",
            "tracking_number": logistics.get("tracking_number") if logistics else None,
            "estimated_delivery_date": logistics.get("estimated_delivery_date") if logistics else None,
        }
        essentials_ctx = {
            "status": essentials.get("status") if essentials else "not_started",
            "order_reference": essentials.get("order_reference") if essentials else None,
        }

        breakdown, milestones, alerts = calculate_readiness(
            target_university=journey.get("target_university", "University"),
            target_city=booking.get("hostel_city", "Hyderabad"),
            move_in_date_str=booking.get("move_in_date", ""),
            booking_data=booking_ctx,
            logistics_data=logistics_ctx,
            essentials_data=essentials_ctx,
        )

        await db.journeys.update_one(
            {"student_id": student_id},
            {"$set": {
                "booking_status": payload.status.value,
                "readiness": breakdown.model_dump(),
                "milestones": [m.model_dump() for m in milestones],
                "alerts": [a.model_dump() for a in alerts],
                "updated_at": datetime.utcnow(),
            }}
        )

    return BookingInDB(**updated_booking)
