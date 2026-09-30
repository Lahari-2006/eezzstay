import random
import string
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.database import get_db
from app.models.essentials import (
    EssentialsBundle,
    EssentialsItem,
    EssentialsCategory,
    EssentialsOrderCreate,
    EssentialsOrderInDB,
    EssentialsOrderStatus,
)
from app.models.user import UserInDB, UserRole
from app.auth import get_current_user, require_roles
from app.services.readiness_score import calculate_readiness

router = APIRouter(prefix="/essentials", tags=["Move-in Essentials Marketplace"])

@router.get("/bundles", response_model=List[EssentialsBundle])
async def get_bundles():
    db = get_db()
    cursor = db.essentials_bundles.find()
    bundles = await cursor.to_list(length=20)
    return [EssentialsBundle(**b) for b in bundles]

@router.get("/items", response_model=List[EssentialsItem])
async def get_items(category: Optional[EssentialsCategory] = Query(None)):
    db = get_db()
    query = {}
    if category:
        query["category"] = category.value
    cursor = db.essentials_catalog.find(query)
    items = await cursor.to_list(length=50)
    return [EssentialsItem(**i) for i in items]

@router.post("/orders", response_model=EssentialsOrderInDB, status_code=status.HTTP_201_CREATED)
async def create_essentials_order(
    payload: EssentialsOrderCreate,
    current_user: UserInDB = Depends(get_current_user)
):
    db = get_db()
    order_id = f"ess-{int(datetime.utcnow().timestamp() * 1000)}"
    ref_code = "EZK-2026-" + "".join(random.choices(string.digits, k=4))

    total_amount = sum(item.price_inr * item.quantity for item in payload.items)

    order_dict = {
        "id": order_id,
        "order_reference": ref_code,
        "student_id": current_user.id,
        "student_name": current_user.full_name,
        "items": [item.model_dump() for item in payload.items],
        "total_amount_inr": total_amount,
        "delivery_address": payload.delivery_address,
        "delivery_city": payload.delivery_city,
        "destination_hostel_id": payload.destination_hostel_id,
        "scheduled_delivery_date": payload.scheduled_delivery_date,
        "status": EssentialsOrderStatus.CONFIRMED,
        "contact_phone": payload.contact_phone or current_user.phone or "",
        "created_at": datetime.utcnow(),
    }

    await db.essentials_orders.insert_one(order_dict)

    # Sync and recalculate student's relocation journey
    journey = await db.journeys.find_one({"student_id": current_user.id})
    if journey:
        booking = await db.bookings.find_one({"student_id": current_user.id})
        logistics = await db.logistics.find_one({"student_id": current_user.id})

        booking_ctx = {
            "status": booking.get("status") if booking else "not_started",
            "hostel_verified": journey.get("hostel_verified", False),
            "hostel_name": journey.get("hostel_name", "Hostel"),
            "confirmed_at": booking.get("confirmed_at") if booking else None
        }
        logistics_ctx = {
            "status": logistics.get("status") if logistics else "not_started",
            "tracking_number": logistics.get("tracking_number") if logistics else None,
            "estimated_delivery_date": logistics.get("estimated_delivery_date") if logistics else None,
        }
        essentials_ctx = {
            "status": "confirmed",
            "order_reference": ref_code,
            "created_at": datetime.utcnow().strftime("%Y-%m-%d"),
        }

        breakdown, milestones, alerts = calculate_readiness(
            target_university=journey.get("target_university", "University"),
            target_city=payload.delivery_city,
            move_in_date_str=journey.get("move_in_date", ""),
            booking_data=booking_ctx,
            logistics_data=logistics_ctx,
            essentials_data=essentials_ctx,
        )

        await db.journeys.update_one(
            {"student_id": current_user.id},
            {"$set": {
                "essentials_order_id": order_id,
                "essentials_status": "confirmed",
                "essentials_eta": payload.scheduled_delivery_date,
                "readiness": breakdown.model_dump(),
                "milestones": [m.model_dump() for m in milestones],
                "alerts": [a.model_dump() for a in alerts],
                "updated_at": datetime.utcnow(),
            }}
        )

    return EssentialsOrderInDB(**order_dict)

@router.get("/my-orders", response_model=List[EssentialsOrderInDB])
async def get_my_essentials_orders(current_user: UserInDB = Depends(get_current_user)):
    db = get_db()
    target_id = current_user.id
    if current_user.role == UserRole.PARENT and current_user.linked_student_id:
        target_id = current_user.linked_student_id

    cursor = db.essentials_orders.find({"student_id": target_id}).sort("created_at", -1)
    orders = await cursor.to_list(length=50)
    return [EssentialsOrderInDB(**o) for o in orders]

@router.put("/orders/{order_id}/status", response_model=EssentialsOrderInDB)
async def update_essentials_status(
    order_id: str,
    new_status: EssentialsOrderStatus,
    current_user: UserInDB = Depends(require_roles([UserRole.ADMIN]))
):
    db = get_db()
    order = await db.essentials_orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    await db.essentials_orders.update_one(
        {"id": order_id},
        {"$set": {"status": new_status.value}}
    )
    updated_order = await db.essentials_orders.find_one({"id": order_id})

    # Recalculate journey readiness
    student_id = order["student_id"]
    journey = await db.journeys.find_one({"student_id": student_id})
    if journey:
        booking = await db.bookings.find_one({"student_id": student_id})
        logistics = await db.logistics.find_one({"student_id": student_id})

        booking_ctx = {
            "status": booking.get("status") if booking else "not_started",
            "hostel_verified": journey.get("hostel_verified", False),
            "hostel_name": journey.get("hostel_name", "Hostel"),
            "confirmed_at": booking.get("confirmed_at") if booking else None
        }
        logistics_ctx = {
            "status": logistics.get("status") if logistics else "not_started",
            "tracking_number": logistics.get("tracking_number") if logistics else None,
            "estimated_delivery_date": logistics.get("estimated_delivery_date") if logistics else None,
        }
        essentials_ctx = {
            "status": new_status.value,
            "order_reference": order["order_reference"],
        }

        breakdown, milestones, alerts = calculate_readiness(
            target_university=journey.get("target_university", "University"),
            target_city=order.get("delivery_city", "Hyderabad"),
            move_in_date_str=journey.get("move_in_date", ""),
            booking_data=booking_ctx,
            logistics_data=logistics_ctx,
            essentials_data=essentials_ctx,
        )

        await db.journeys.update_one(
            {"student_id": student_id},
            {"$set": {
                "essentials_status": new_status.value,
                "readiness": breakdown.model_dump(),
                "milestones": [m.model_dump() for m in milestones],
                "alerts": [a.model_dump() for a in alerts],
                "updated_at": datetime.utcnow(),
            }}
        )

    return EssentialsOrderInDB(**updated_order)
