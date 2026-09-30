import random
import string
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.config import settings
from app.database import get_db
from app.models.user import (
    UserCreate,
    UserLogin,
    UserPublic,
    UserInDB,
    UserRole,
    Token,
    ParentLinkRequest,
)
from app.models.journey import RelocationJourneyInDB
from app.services.readiness_score import calculate_readiness
from app.auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

class DemoLoginRequest(BaseModel):
    role: UserRole

@router.get("/demo-status")
async def get_demo_status():
    """
    Returns whether DEMO_MODE is enabled on the backend.
    In live production, DEMO_MODE=False prevents frontend demo switcher rendering
    and blocks all demo credential bypass endpoints.
    """
    return {
        "demo_mode_enabled": settings.DEMO_MODE,
        "message": "Demo mode is active" if settings.DEMO_MODE else "Live production mode: Demo switcher disabled."
    }

@router.post("/demo-login", response_model=Token)
async def demo_login(payload: DemoLoginRequest):
    """
    1-Click Demo Login and Role Switcher.
    STRICTLY GATED behind settings.DEMO_MODE.
    """
    if not settings.DEMO_MODE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Demo Role Switcher is strictly disabled in production mode. Set DEMO_MODE=true in server environment to enable demo privileges."
        )

    db = get_db()
    email_map = {
        UserRole.STUDENT: "student@ezeestayy.com",
        UserRole.PARENT: "parent@ezeestayy.com",
        UserRole.HOSTEL_OWNER: "partner@ezeestayy.com",
        UserRole.ADMIN: "admin@ezeestayy.com",
    }

    target_email = email_map.get(payload.role)
    user_data = await db.users.find_one({"email": target_email})
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pre-seeded demo user for role '{payload.role.value}' not found. Please ensure database is seeded."
        )

    user_obj = UserInDB(**user_data)
    token = create_access_token(data={"sub": user_obj.id, "role": user_obj.role.value})
    user_public = UserPublic(**user_obj.model_dump())

    return Token(access_token=token, token_type="bearer", user=user_public)

@router.post("/register", response_model=Token)
async def register_user(payload: UserCreate):
    db = get_db()
    existing = await db.users.find_one({"email": payload.email.lower()})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    user_id = f"usr-{int(datetime.utcnow().timestamp() * 1000)}"
    link_code = None
    if payload.role == UserRole.STUDENT:
        link_code = "EZ" + "".join(random.choices(string.digits, k=4))

    hashed_pw = get_password_hash(payload.password)

    user_dict = {
        "id": user_id,
        "email": payload.email.lower(),
        "hashed_password": hashed_pw,
        "full_name": payload.full_name,
        "phone": payload.phone,
        "role": payload.role,
        "city": payload.city or "Hyderabad",
        "avatar_url": payload.avatar_url or f"https://api.dicebear.com/7.x/initials/svg?seed={payload.full_name}",
        "is_active": True,
        "created_at": datetime.utcnow(),
        "target_university": payload.target_university or "KL University Hyderabad",
        "target_city": payload.target_city or "Hyderabad",
        "origin_city": payload.origin_city or "Visakhapatnam",
        "move_in_date": payload.move_in_date,
        "student_link_code": link_code,
        "linked_parent_id": None,
        "linked_student_id": None,
        "linked_student_name": None,
        "business_name": payload.business_name,
        "gst_number": payload.gst_number,
        "owned_hostel_ids": [],
    }

    # If registering as a parent with a link code
    if payload.role == UserRole.PARENT and payload.student_link_code:
        student_doc = await db.users.find_one({"student_link_code": payload.student_link_code.upper()})
        if student_doc:
            user_dict["linked_student_id"] = student_doc["id"]
            user_dict["linked_student_name"] = student_doc["full_name"]
            # Update student record with parent link
            await db.users.update_one(
                {"id": student_doc["id"]},
                {"$set": {"linked_parent_id": user_id}}
            )

    await db.users.insert_one(user_dict)

    # If student, initialize relocation journey
    if payload.role == UserRole.STUDENT:
        breakdown, milestones, alerts = calculate_readiness(
            target_university=user_dict["target_university"],
            target_city=user_dict["target_city"],
            move_in_date_str=user_dict["move_in_date"] or "",
            booking_data={"status": "not_started"},
            logistics_data={"status": "not_started"},
            essentials_data={"status": "not_started"},
        )
        journey_dict = {
            "id": f"jrn-{user_id}",
            "student_id": user_id,
            "student_name": user_dict["full_name"],
            "student_email": user_dict["email"],
            "student_phone": user_dict["phone"],
            "target_university": user_dict["target_university"],
            "target_city": user_dict["target_city"],
            "origin_city": user_dict["origin_city"],
            "move_in_date": user_dict["move_in_date"] or "",
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
        await db.journeys.insert_one(journey_dict)

    user_obj = UserInDB(**user_dict)
    token = create_access_token(data={"sub": user_obj.id, "role": user_obj.role.value})
    user_public = UserPublic(**user_obj.model_dump())

    return Token(access_token=token, token_type="bearer", user=user_public)

@router.post("/login", response_model=Token)
async def login_user(payload: UserLogin):
    db = get_db()
    user_data = await db.users.find_one({"email": payload.email.lower()})
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not verify_password(payload.password, user_data["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    user_obj = UserInDB(**user_data)
    token = create_access_token(data={"sub": user_obj.id, "role": user_obj.role.value})
    user_public = UserPublic(**user_obj.model_dump())

    return Token(access_token=token, token_type="bearer", user=user_public)

@router.get("/me", response_model=UserPublic)
async def get_me(current_user: UserInDB = Depends(get_current_user)):
    return UserPublic(**current_user.model_dump())

@router.post("/link-parent")
async def link_parent_to_student(
    payload: ParentLinkRequest,
    current_user: UserInDB = Depends(get_current_user)
):
    if current_user.role != UserRole.PARENT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only parent accounts can link to student profiles."
        )

    db = get_db()
    code_clean = payload.student_link_code.strip().upper()
    student_doc = await db.users.find_one({"student_link_code": code_clean})
    if not student_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No student found with link code '{code_clean}'. Please verify the 6-character code."
        )

    # Link parent to student
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {
            "linked_student_id": student_doc["id"],
            "linked_student_name": student_doc["full_name"],
        }}
    )
    # Link student to parent
    await db.users.update_one(
        {"id": student_doc["id"]},
        {"$set": {"linked_parent_id": current_user.id}}
    )

    return {
        "success": True,
        "message": f"Successfully linked to student {student_doc['full_name']}.",
        "student_id": student_doc["id"],
        "student_name": student_doc["full_name"],
    }
