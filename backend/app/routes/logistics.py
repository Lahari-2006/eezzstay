import random
import string
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from app.database import get_db
from app.models.logistics import (
    LogisticsQuoteRequest,
    LogisticsQuoteResponse,
    LogisticsOrderCreate,
    LogisticsOrderInDB,
    LogisticsStatus,
    TrackingCheckpoint,
)
from app.models.user import UserInDB, UserRole
from app.models.hostel import VerificationStatus
from app.auth import get_current_user, require_roles
from app.services.readiness_score import calculate_readiness

router = APIRouter(prefix="/logistics", tags=["Logistics"])

# Distance heuristics between major Indian student origin/destination pairs (in km)
CITY_DISTANCES = {
    ("visakhapatnam", "hyderabad"): (620, 2),
    ("vijayawada", "hyderabad"): (275, 1),
    ("patna", "bengaluru"): (2100, 4),
    ("delhi", "hyderabad"): (1550, 3),
    ("mumbai", "pune"): (150, 1),
    ("chennai", "hyderabad"): (630, 2),
    ("kolkata", "bengaluru"): (1880, 4),
    ("jaipur", "hyderabad"): (1400, 3),
}

def get_distance_and_transit(origin: str, dest: str) -> tuple[int, int]:
    key = (origin.strip().lower(), dest.strip().lower())
    rev_key = (dest.strip().lower(), origin.strip().lower())
    if key in CITY_DISTANCES:
        return CITY_DISTANCES[key]
    if rev_key in CITY_DISTANCES:
        return CITY_DISTANCES[rev_key]
    return (800, 3) # default fallback

@router.post("/quote", response_model=LogisticsQuoteResponse)
async def get_logistics_quote(payload: LogisticsQuoteRequest):
    distance_km, transit_days = get_distance_and_transit(payload.origin_city, payload.destination_city)
    if payload.is_express:
        transit_days = max(1, transit_days - 1)

    total_weight = sum(p.weight_kg * p.quantity for p in payload.packages)
    if total_weight <= 0:
        total_weight = 20.0

    # Base rate: ₹40/kg + handling + express surcharge
    base_rate = total_weight * 45
    handling_fee = len(payload.packages) * 100
    express_surcharge = 400 if payload.is_express else 0
    estimated_cost = int(round(base_rate + handling_fee + express_surcharge))

    try:
        p_date = datetime.strptime(payload.pickup_date[:10], "%Y-%m-%d")
    except Exception:
        p_date = datetime.utcnow()
    eta_date = p_date + timedelta(days=transit_days)

    return LogisticsQuoteResponse(
        estimated_cost_inr=estimated_cost,
        estimated_transit_days=transit_days,
        estimated_delivery_date=eta_date.strftime("%Y-%m-%d"),
        origin_hub=f"{payload.origin_city.title()} Logistics Hub",
        destination_hub=f"{payload.destination_city.title()} Central Hub",
        distance_km=distance_km,
    )

@router.post("/orders", response_model=LogisticsOrderInDB, status_code=status.HTTP_201_CREATED)
async def create_logistics_order(
    payload: LogisticsOrderCreate,
    current_user: UserInDB = Depends(get_current_user)
):
    db = get_db()
    order_id = f"log-{int(datetime.utcnow().timestamp() * 1000)}"
    city_code = payload.destination_city[:3].upper() if payload.destination_city else "REL"
    tracking_no = f"EZL-{city_code}-" + "".join(random.choices(string.digits, k=5))

    distance_km, transit_days = get_distance_and_transit(payload.origin_city, payload.destination_city)
    if payload.is_express:
        transit_days = max(1, transit_days - 1)

    try:
        p_date = datetime.strptime(payload.pickup_date[:10], "%Y-%m-%d")
    except Exception:
        p_date = datetime.utcnow()
    eta_date = (p_date + timedelta(days=transit_days)).strftime("%Y-%m-%d")

    total_weight = sum(p.weight_kg * p.quantity for p in payload.packages)
    total_cost = int(round(total_weight * 45 + len(payload.packages) * 100 + (400 if payload.is_express else 0)))

    hostel_name = None
    if payload.destination_hostel_id:
        hostel = await db.hostels.find_one({"id": payload.destination_hostel_id})
        if hostel:
            hostel_name = hostel["name"]

    initial_checkpoint = TrackingCheckpoint(
        status=LogisticsStatus.BOOKED,
        location=f"{payload.origin_city.title()} City Booking Hub",
        description="Luggage pickup scheduled. Carrier partner assigned with tamper-evident security seal bags.",
        timestamp=datetime.utcnow(),
    )

    order_dict = {
        "id": order_id,
        "tracking_number": tracking_no,
        "student_id": current_user.id,
        "student_name": current_user.full_name,
        "student_phone": payload.recipient_phone or current_user.phone or "",
        "origin_city": payload.origin_city,
        "origin_address": payload.origin_address,
        "origin_pincode": payload.origin_pincode,
        "destination_city": payload.destination_city,
        "destination_hostel_id": payload.destination_hostel_id,
        "destination_hostel_name": hostel_name,
        "destination_address": payload.destination_address,
        "destination_pincode": payload.destination_pincode,
        "packages": [p.model_dump() for p in payload.packages],
        "total_weight_kg": total_weight,
        "pickup_date": payload.pickup_date,
        "estimated_delivery_date": eta_date,
        "actual_delivery_date": None,
        "is_express": payload.is_express,
        "total_cost_inr": total_cost,
        "status": LogisticsStatus.BOOKED,
        "checkpoints": [initial_checkpoint.model_dump()],
        "created_at": datetime.utcnow(),
    }

    await db.logistics.insert_one(order_dict)

    # Sync and recalculate student's relocation journey
    journey = await db.journeys.find_one({"student_id": current_user.id})
    if journey:
        booking = await db.bookings.find_one({"student_id": current_user.id})
        essentials = await db.essentials_orders.find_one({"student_id": current_user.id})

        booking_ctx = {
            "status": booking.get("status") if booking else "not_started",
            "hostel_verified": journey.get("hostel_verified", False),
            "hostel_name": journey.get("hostel_name", "Hostel"),
            "confirmed_at": booking.get("confirmed_at") if booking else None
        }
        logistics_ctx = {
            "status": "booked",
            "tracking_number": tracking_no,
            "estimated_delivery_date": eta_date,
            "created_at": datetime.utcnow().strftime("%Y-%m-%d"),
        }
        essentials_ctx = {
            "status": essentials.get("status") if essentials else "not_started",
            "order_reference": essentials.get("order_reference") if essentials else None,
        }

        breakdown, milestones, alerts = calculate_readiness(
            target_university=journey.get("target_university", "University"),
            target_city=payload.destination_city,
            move_in_date_str=journey.get("move_in_date", ""),
            booking_data=booking_ctx,
            logistics_data=logistics_ctx,
            essentials_data=essentials_ctx,
        )

        await db.journeys.update_one(
            {"student_id": current_user.id},
            {"$set": {
                "logistics_order_id": order_id,
                "logistics_status": "booked",
                "logistics_eta": eta_date,
                "readiness": breakdown.model_dump(),
                "milestones": [m.model_dump() for m in milestones],
                "alerts": [a.model_dump() for a in alerts],
                "updated_at": datetime.utcnow(),
            }}
        )

    return LogisticsOrderInDB(**order_dict)

@router.get("/my-orders", response_model=List[LogisticsOrderInDB])
async def get_my_logistics_orders(current_user: UserInDB = Depends(get_current_user)):
    db = get_db()
    target_id = current_user.id
    if current_user.role == UserRole.PARENT and current_user.linked_student_id:
        target_id = current_user.linked_student_id

    cursor = db.logistics.find({"student_id": target_id}).sort("created_at", -1)
    orders = await cursor.to_list(length=50)
    return [LogisticsOrderInDB(**o) for o in orders]

@router.get("/track/{tracking_number}", response_model=LogisticsOrderInDB)
async def track_shipment(tracking_number: str):
    db = get_db()
    order = await db.logistics.find_one({"tracking_number": tracking_number.strip().upper()})
    if not order:
        raise HTTPException(status_code=404, detail="Shipment tracking number not found")
    return LogisticsOrderInDB(**order)

@router.put("/orders/{order_id}/status", response_model=LogisticsOrderInDB)
async def update_logistics_status(
    order_id: str,
    new_status: LogisticsStatus,
    location: str,
    description: str,
    current_user: UserInDB = Depends(require_roles([UserRole.ADMIN]))
):
    db = get_db()
    order = await db.logistics.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    checkpoint = TrackingCheckpoint(
        status=new_status,
        location=location,
        description=description,
        timestamp=datetime.utcnow(),
    )

    update_fields = {
        "status": new_status.value,
        "checkpoints": order.get("checkpoints", []) + [checkpoint.model_dump()],
    }
    if new_status == LogisticsStatus.DELIVERED:
        update_fields["actual_delivery_date"] = datetime.utcnow().strftime("%Y-%m-%d")

    await db.logistics.update_one({"id": order_id}, {"$set": update_fields})
    updated_order = await db.logistics.find_one({"id": order_id})

    # Recalculate journey readiness
    student_id = order["student_id"]
    journey = await db.journeys.find_one({"student_id": student_id})
    if journey:
        booking = await db.bookings.find_one({"student_id": student_id})
        essentials = await db.essentials_orders.find_one({"student_id": student_id})

        booking_ctx = {
            "status": booking.get("status") if booking else "not_started",
            "hostel_verified": journey.get("hostel_verified", False),
            "hostel_name": journey.get("hostel_name", "Hostel"),
            "confirmed_at": booking.get("confirmed_at") if booking else None
        }
        logistics_ctx = {
            "status": new_status.value,
            "tracking_number": order["tracking_number"],
            "estimated_delivery_date": order.get("estimated_delivery_date"),
        }
        essentials_ctx = {
            "status": essentials.get("status") if essentials else "not_started",
            "order_reference": essentials.get("order_reference") if essentials else None,
        }

        breakdown, milestones, alerts = calculate_readiness(
            target_university=journey.get("target_university", "University"),
            target_city=order.get("destination_city", "Hyderabad"),
            move_in_date_str=journey.get("move_in_date", ""),
            booking_data=booking_ctx,
            logistics_data=logistics_ctx,
            essentials_data=essentials_ctx,
        )

        await db.journeys.update_one(
            {"student_id": student_id},
            {"$set": {
                "logistics_status": new_status.value,
                "readiness": breakdown.model_dump(),
                "milestones": [m.model_dump() for m in milestones],
                "alerts": [a.model_dump() for a in alerts],
                "updated_at": datetime.utcnow(),
            }}
        )

    return LogisticsOrderInDB(**updated_order)
