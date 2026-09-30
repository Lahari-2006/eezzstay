from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from app.database import get_db
from app.models.user import UserInDB, UserPublic, UserRole
from app.models.hostel import HostelInDB, VerificationStatus, HostelVerificationAction
from app.models.journey import RelocationJourneyInDB, JourneyAlert, AlertSeverity
from app.auth import require_roles

router = APIRouter(prefix="/admin", tags=["Admin & Operations Command"])

class InterventionAlertPayload(BaseModel):
    title: str
    message: str
    severity: AlertSeverity = AlertSeverity.CRITICAL
    action_text: Optional[str] = "Talk to EzeeStayy Concierge"
    action_link: Optional[str] = "/app/dashboard"

@router.get("/kpis")
async def get_platform_kpis(
    current_user: UserInDB = Depends(require_roles([UserRole.ADMIN]))
):
    db = get_db()

    total_journeys = await db.journeys.count_documents({})
    journeys_cursor = db.journeys.find()
    journeys_list = await journeys_cursor.to_list(length=500)

    scores = [j.get("readiness", {}).get("total_score", 0) for j in journeys_list]
    avg_readiness = round(sum(scores) / len(scores), 1) if scores else 0.0

    critical_count = sum(1 for s in scores if s < 50)
    needs_attention_count = sum(1 for s in scores if 50 <= s < 80)
    on_track_count = sum(1 for s in scores if s >= 80)

    total_hostels = await db.hostels.count_documents({})
    verified_hostels = await db.hostels.count_documents({"verification_status": VerificationStatus.VERIFIED.value})
    pending_hostels = await db.hostels.count_documents({"verification_status": VerificationStatus.PENDING.value})

    total_bookings = await db.bookings.count_documents({})
    confirmed_bookings = await db.bookings.count_documents({"status": "confirmed"})

    total_logistics = await db.logistics.count_documents({})
    logistics_in_transit = await db.logistics.count_documents({"status": {"$in": ["in_transit", "out_for_delivery", "picked_up"]}})

    total_essentials = await db.essentials_orders.count_documents({})

    return {
        "total_student_journeys": total_journeys,
        "average_readiness_score": avg_readiness,
        "risk_breakdown": {
            "critical_risk": critical_count,
            "needs_attention": needs_attention_count,
            "on_track": on_track_count,
        },
        "hostels_stats": {
            "total": total_hostels,
            "verified": verified_hostels,
            "pending_verification": pending_hostels,
        },
        "bookings_stats": {
            "total": total_bookings,
            "confirmed": confirmed_bookings,
        },
        "logistics_stats": {
            "total": total_logistics,
            "active_in_transit": logistics_in_transit,
        },
        "essentials_orders_total": total_essentials,
    }

@router.get("/risk-board", response_model=List[RelocationJourneyInDB])
async def get_risk_board(
    tier: Optional[str] = Query(None, description="Filter by status tier: 'Critical Risk', 'Needs Attention', 'On Track'"),
    current_user: UserInDB = Depends(require_roles([UserRole.ADMIN]))
):
    db = get_db()
    cursor = db.journeys.find().sort("readiness.total_score", 1) # Ascending: lowest score (highest risk) first
    journeys_list = await cursor.to_list(length=200)

    if tier:
        journeys_list = [j for j in journeys_list if j.get("readiness", {}).get("status_tier") == tier]

    return [RelocationJourneyInDB(**j) for j in journeys_list]

@router.get("/verification-queue", response_model=List[HostelInDB])
async def get_verification_queue(
    current_user: UserInDB = Depends(require_roles([UserRole.ADMIN]))
):
    db = get_db()
    cursor = db.hostels.find({"verification_status": VerificationStatus.PENDING.value}).sort("created_at", -1)
    hostels_list = await cursor.to_list(length=100)
    return [HostelInDB(**h) for h in hostels_list]

@router.put("/hostels/{hostel_id}/verify", response_model=HostelInDB)
async def verify_hostel_action(
    hostel_id: str,
    payload: HostelVerificationAction,
    current_user: UserInDB = Depends(require_roles([UserRole.ADMIN]))
):
    db = get_db()
    hostel = await db.hostels.find_one({"id": hostel_id})
    if not hostel:
        raise HTTPException(status_code=404, detail="Hostel not found")

    new_trust_score = payload.trust_score or (95 if payload.status == VerificationStatus.VERIFIED else 40)
    breakdown = hostel.get("trust_breakdown", {})
    if payload.status == VerificationStatus.VERIFIED:
        breakdown["physical_inspection"] = 100
        breakdown["fire_safety_clearance"] = 95
        breakdown["police_verification"] = 95
        breakdown["food_hygiene_fssai"] = 95
    else:
        breakdown["physical_inspection"] = 0

    # Update documents statuses as well
    docs = hostel.get("documents", [])
    for d in docs:
        d["status"] = payload.status.value
        d["verified_at"] = datetime.utcnow() if payload.status == VerificationStatus.VERIFIED else None
        d["notes"] = payload.audit_notes or "Reviewed by EzeeStayy Trust & Safety Ops"

    await db.hostels.update_one(
        {"id": hostel_id},
        {"$set": {
            "verification_status": payload.status.value,
            "trust_score": new_trust_score,
            "trust_breakdown": breakdown,
            "documents": docs,
        }}
    )

    # Sync verification status to any associated bookings / journeys
    await db.journeys.update_many(
        {"hostel_id": hostel_id},
        {"$set": {"hostel_verified": payload.status == VerificationStatus.VERIFIED}}
    )

    updated_hostel = await db.hostels.find_one({"id": hostel_id})
    return HostelInDB(**updated_hostel)

@router.post("/journeys/{student_id}/intervention-alert")
async def send_intervention_alert(
    student_id: str,
    payload: InterventionAlertPayload,
    current_user: UserInDB = Depends(require_roles([UserRole.ADMIN]))
):
    db = get_db()
    journey = await db.journeys.find_one({"student_id": student_id})
    if not journey:
        raise HTTPException(status_code=404, detail="Student journey not found")

    alert = JourneyAlert(
        id=f"alert-ops-{int(datetime.utcnow().timestamp() * 1000)}",
        title=payload.title,
        message=payload.message,
        severity=payload.severity,
        pillar="timeline",
        action_text=payload.action_text,
        action_link=payload.action_link,
    )

    await db.journeys.update_one(
        {"student_id": student_id},
        {"$push": {"alerts": {"$each": [alert.model_dump()], "$position": 0}}}
    )

    return {"success": True, "message": f"Intervention alert dispatched to {journey['student_name']}."}

@router.get("/users", response_model=List[UserPublic])
async def list_users(
    role: Optional[UserRole] = Query(None),
    current_user: UserInDB = Depends(require_roles([UserRole.ADMIN]))
):
    db = get_db()
    query = {}
    if role:
        query["role"] = role.value
    cursor = db.users.find(query).sort("created_at", -1)
    users = await cursor.to_list(length=100)
    return [UserPublic(**u) for u in users]
