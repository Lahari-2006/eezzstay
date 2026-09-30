import logging
from datetime import datetime, timedelta
from app.auth import get_password_hash
from app.database import get_db
from app.models.user import UserRole
from app.models.hostel import GenderType, VerificationStatus, DocumentType
from app.models.booking import BookingStatus
from app.models.logistics import PackageType, LogisticsStatus
from app.models.essentials import EssentialsCategory, EssentialsOrderStatus
from app.services.readiness_score import calculate_readiness

logger = logging.getLogger(__name__)

async def seed_database():
    db = get_db()
    if db is None:
        logger.error("Cannot seed: database not initialized.")
        return

    logger.info("Starting database seeding with rich Indian migration ecosystem data...")

    # Clear existing collections
    await db.users.delete_many({})
    await db.hostels.delete_many({})
    await db.bookings.delete_many({})
    await db.logistics.delete_many({})
    await db.essentials_catalog.delete_many({})
    await db.essentials_bundles.delete_many({})
    await db.essentials_orders.delete_many({})
    await db.journeys.delete_many({})
    await db.universities.delete_many({})
    await db.reviews.delete_many({})

    password_hash = get_password_hash("password123")
    today = datetime.utcnow()
    move_in_date_str = (today + timedelta(days=7)).strftime("%Y-%m-%d")

    # ----------------------------------------------------
    # 1. Seed Users
    # ----------------------------------------------------
    student_user = {
        "id": "usr-student-001",
        "email": "student@ezeestayy.com",
        "hashed_password": password_hash,
        "full_name": "Aarav Sharma",
        "phone": "+91 98765 43210",
        "role": UserRole.STUDENT,
        "city": "Hyderabad",
        "target_university": "KL University Hyderabad",
        "target_city": "Hyderabad",
        "origin_city": "Visakhapatnam",
        "move_in_date": move_in_date_str,
        "student_link_code": "EZ7891",
        "linked_parent_id": "usr-parent-001",
        "avatar_url": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
        "is_active": True,
        "created_at": today - timedelta(days=10),
    }

    parent_user = {
        "id": "usr-parent-001",
        "email": "parent@ezeestayy.com",
        "hashed_password": password_hash,
        "full_name": "Rajesh Sharma",
        "phone": "+91 98480 12345",
        "role": UserRole.PARENT,
        "city": "Visakhapatnam",
        "linked_student_id": "usr-student-001",
        "linked_student_name": "Aarav Sharma",
        "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        "is_active": True,
        "created_at": today - timedelta(days=10),
    }

    owner_user = {
        "id": "usr-owner-001",
        "email": "partner@ezeestayy.com",
        "hashed_password": password_hash,
        "full_name": "Venkata Rao",
        "phone": "+91 94401 56789",
        "role": UserRole.HOSTEL_OWNER,
        "city": "Hyderabad",
        "business_name": "Sri Sai & Stanza Hostels Network",
        "gst_number": "36AABCS1429B1Z8",
        "owned_hostel_ids": ["hst-hyd-001", "hst-hyd-002", "hst-hyd-003"],
        "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
        "is_active": True,
        "created_at": today - timedelta(days=60),
    }

    admin_user = {
        "id": "usr-admin-001",
        "email": "admin@ezeestayy.com",
        "hashed_password": password_hash,
        "full_name": "EzeeStayy Relocation Ops",
        "phone": "+91 99999 00000",
        "role": UserRole.ADMIN,
        "city": "Hyderabad",
        "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        "is_active": True,
        "created_at": today - timedelta(days=90),
    }

    # Extra students for risk board & admin view
    extra_student_risk = {
        "id": "usr-student-002",
        "email": "priya.reddy@gmail.com",
        "hashed_password": password_hash,
        "full_name": "Priya Reddy",
        "phone": "+91 98111 22334",
        "role": UserRole.STUDENT,
        "city": "Hyderabad",
        "target_university": "IIT Hyderabad",
        "target_city": "Hyderabad",
        "origin_city": "Vijayawada",
        "move_in_date": (today + timedelta(days=2)).strftime("%Y-%m-%d"), # 2 days left!
        "student_link_code": "EZ2234",
        "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
        "is_active": True,
        "created_at": today - timedelta(days=5),
    }

    extra_student_bengaluru = {
        "id": "usr-student-003",
        "email": "rohit.verma@gmail.com",
        "hashed_password": password_hash,
        "full_name": "Rohit Verma",
        "phone": "+91 97222 33445",
        "role": UserRole.STUDENT,
        "city": "Bengaluru",
        "target_university": "Manipal Institute of Technology",
        "target_city": "Bengaluru",
        "origin_city": "Patna",
        "move_in_date": (today + timedelta(days=12)).strftime("%Y-%m-%d"),
        "student_link_code": "EZ5512",
        "avatar_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
        "is_active": True,
        "created_at": today - timedelta(days=3),
    }

    await db.users.insert_many([
        student_user, parent_user, owner_user, admin_user,
        extra_student_risk, extra_student_bengaluru
    ])

    # ----------------------------------------------------
    # 2. Seed Universities
    # ----------------------------------------------------
    universities = [
        {
            "id": "uni-klu-hyd",
            "name": "KL University Hyderabad",
            "short_name": "KLU Hyderabad",
            "slug": "kl-university-hyderabad",
            "city": "Hyderabad",
            "state": "Telangana",
            "address": "Aziznagar, Bowrampet / Gandipet, Hyderabad, Telangana 500075",
            "student_population": 8500,
            "popular_majors": ["Computer Science & AI", "Electronics & Communication", "Data Science", "BBA"],
            "image_url": "https://images.unsplash.com/photo-1562774053-701939374585?w=600",
            "featured": True,
            "verified_hostel_count": 8,
            "recommended_hostel_ids": ["hst-hyd-001", "hst-hyd-003"],
        },
        {
            "id": "uni-iit-hyd",
            "name": "IIT Hyderabad",
            "short_name": "IIT-H",
            "slug": "iit-hyderabad",
            "city": "Hyderabad",
            "state": "Telangana",
            "address": "NH-65, Kandi, Sangareddy, Telangana 502285",
            "student_population": 4200,
            "popular_majors": ["B.Tech CS", "Artificial Intelligence", "Mechanical", "Design"],
            "image_url": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600",
            "featured": True,
            "verified_hostel_count": 5,
            "recommended_hostel_ids": ["hst-hyd-002"],
        },
        {
            "id": "uni-iiit-hyd",
            "name": "IIIT Hyderabad",
            "short_name": "IIIT-H",
            "slug": "iiit-hyderabad",
            "city": "Hyderabad",
            "state": "Telangana",
            "address": "Prof. C R Rao Road, Gachibowli, Hyderabad 500032",
            "student_population": 2100,
            "popular_majors": ["Computer Science", "Computational Linguistics", "Electronics"],
            "image_url": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600",
            "featured": True,
            "verified_hostel_count": 6,
            "recommended_hostel_ids": ["hst-hyd-002", "hst-hyd-001"],
        },
        {
            "id": "uni-bits-hyd",
            "name": "BITS Pilani Hyderabad Campus",
            "short_name": "BITS Hyderabad",
            "slug": "bits-pilani-hyderabad",
            "city": "Hyderabad",
            "state": "Telangana",
            "address": "Jawahar Nagar, Kapra Mandal, Shamirpet, Hyderabad 500078",
            "student_population": 5200,
            "popular_majors": ["Computer Science", "Economics", "Chemical Engineering", "Pharmacy"],
            "image_url": "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=600",
            "featured": True,
            "verified_hostel_count": 4,
            "recommended_hostel_ids": ["hst-hyd-003"],
        },
        {
            "id": "uni-manipal-blr",
            "name": "Manipal Institute of Technology - Bengaluru Campus",
            "short_name": "MAHE Bengaluru",
            "slug": "manipal-bengaluru",
            "city": "Bengaluru",
            "state": "Karnataka",
            "address": "Govindapura, Yelahanka, Bengaluru 560064",
            "student_population": 6000,
            "popular_majors": ["Cybersecurity", "Data Analytics", "Information Technology"],
            "image_url": "https://images.unsplash.com/photo-1525921429624-479b6a26d84d?w=600",
            "featured": True,
            "verified_hostel_count": 7,
            "recommended_hostel_ids": ["hst-blr-001"],
        },
        {
            "id": "uni-coep-pune",
            "name": "COEP Technological University Pune",
            "short_name": "COEP Pune",
            "slug": "coep-pune",
            "city": "Pune",
            "state": "Maharashtra",
            "address": "Wellesley Rd, Shivajinagar, Pune 411005",
            "student_population": 4800,
            "popular_majors": ["Mechanical", "Computer Engineering", "Civil", "Instrumentation"],
            "image_url": "https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=600",
            "featured": True,
            "verified_hostel_count": 6,
            "recommended_hostel_ids": ["hst-pune-001"],
        }
    ]
    await db.universities.insert_many(universities)

    # ----------------------------------------------------
    # 3. Seed Hostels
    # ----------------------------------------------------
    hostels = [
        {
            "id": "hst-hyd-001",
            "owner_id": "usr-owner-001",
            "owner_name": "Venkata Rao",
            "name": "Stanza Living - Kyoto House (Verified Student PG)",
            "description": "Premium tech-enabled co-living space designed exclusively for collegiate students. Includes 3 daily high-protein meals, high-speed 300 Mbps fiber WiFi, daily housekeeping, 24/7 CCTV, and dedicated quiet study rooms.",
            "city": "Hyderabad",
            "locality": "Bowrampet / Gandipet Main Road",
            "address": "Plot 42-45, Near KL University Campus Road, Hyderabad, Telangana 500075",
            "gender_type": GenderType.BOYS,
            "nearby_universities": [
                {"university_name": "KL University Hyderabad", "distance_km": 0.8, "transit_mins": 4},
                {"university_name": "IIIT Hyderabad", "distance_km": 11.2, "transit_mins": 25},
            ],
            "amenities": [
                "300 Mbps Fiber WiFi",
                "3 Times Hygienic Food (North & South)",
                "Air Conditioning",
                "Biometric Entry & CCTV Security",
                "Daily Room Cleaning",
                "Commercial Laundry Machines",
                "24/7 Power Backup (DG)",
                "RO Water Purifier",
                "Sound-insulated Study Lounge",
                "Doctor on Call"
            ],
            "room_options": [
                {
                    "room_type": "2-Sharing AC",
                    "price_monthly": 12500,
                    "security_deposit": 12500,
                    "available_beds": 3,
                    "total_beds": 20,
                    "attached_bathroom": True,
                    "ac_available": True
                },
                {
                    "room_type": "Single Private AC",
                    "price_monthly": 18000,
                    "security_deposit": 18000,
                    "available_beds": 1,
                    "total_beds": 8,
                    "attached_bathroom": True,
                    "ac_available": True
                },
                {
                    "room_type": "3-Sharing Non-AC",
                    "price_monthly": 9000,
                    "security_deposit": 9000,
                    "available_beds": 4,
                    "total_beds": 15,
                    "attached_bathroom": True,
                    "ac_available": False
                }
            ],
            "rules": [
                "Biometric entry cutoff: 10:30 PM (extension permitted with parent SMS consent)",
                "Strict zero-tolerance policy on smoking/alcohol",
                "Guests allowed in lobby lounge only until 8:00 PM"
            ],
            "food_included": True,
            "food_type": "Breakfast, Lunch, Evening High-Tea & Dinner (Veg + Non-Veg Wed/Sun)",
            "contact_phone": "+91 94401 56789",
            "contact_email": "kyoto.hyd@stanzaliving.com",
            "cover_image": "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800",
            "images": [
                "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800",
                "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800",
                "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
                "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800"
            ],
            "verification_status": VerificationStatus.VERIFIED,
            "trust_score": 96,
            "trust_breakdown": {
                "physical_inspection": 100,
                "fire_safety_clearance": 100,
                "police_verification": 95,
                "food_hygiene_fssai": 95,
                "student_feedback_rating": 92
            },
            "documents": [
                {
                    "id": "doc-001",
                    "doc_type": DocumentType.TRADE_LICENSE,
                    "title": "GHMC Commercial Trade License 2026",
                    "file_url": "https://docs.ezeestayy.com/mock/trade_license_kyoto.pdf",
                    "status": VerificationStatus.VERIFIED,
                    "uploaded_at": today - timedelta(days=30),
                    "verified_at": today - timedelta(days=28),
                    "notes": "Verified against Telangana GHMC Portal"
                },
                {
                    "id": "doc-002",
                    "doc_type": DocumentType.FIRE_SAFETY,
                    "title": "Telangana Fire & Emergency NOC",
                    "file_url": "https://docs.ezeestayy.com/mock/fire_noc_kyoto.pdf",
                    "status": VerificationStatus.VERIFIED,
                    "uploaded_at": today - timedelta(days=30),
                    "verified_at": today - timedelta(days=28),
                    "notes": "Hydrant and fire alarm clearance certified"
                },
                {
                    "id": "doc-003",
                    "doc_type": DocumentType.FOOD_SAFETY_FSSAI,
                    "title": "FSSAI Food Safety License",
                    "file_url": "https://docs.ezeestayy.com/mock/fssai_kyoto.pdf",
                    "status": VerificationStatus.VERIFIED,
                    "uploaded_at": today - timedelta(days=30),
                    "verified_at": today - timedelta(days=28),
                    "notes": "Grade A hygiene rating"
                }
            ],
            "avg_rating": 4.8,
            "review_count": 34,
            "created_at": today - timedelta(days=60),
        },
        {
            "id": "hst-hyd-002",
            "owner_id": "usr-owner-001",
            "owner_name": "Venkata Rao",
            "name": "Zolo Scholar - High-Tech Residency",
            "description": "Modern student residency located in Gachibowli near premier engineering colleges. Features fully air-conditioned rooms, high-speed gaming-grade WiFi, biometric smart lock access, on-site gym, and cafeteria.",
            "city": "Hyderabad",
            "locality": "Gachibowli Financial District",
            "address": "Telecom Nagar, Near IIIT Junction, Gachibowli, Hyderabad 500032",
            "gender_type": GenderType.CO_ED,
            "nearby_universities": [
                {"university_name": "IIIT Hyderabad", "distance_km": 1.1, "transit_mins": 5},
                {"university_name": "KL University Hyderabad", "distance_km": 14.5, "transit_mins": 30},
                {"university_name": "IIT Hyderabad", "distance_km": 28.0, "transit_mins": 45}
            ],
            "amenities": [
                "250 Mbps WiFi",
                "Air Conditioning",
                "Meals (Breakfast & Dinner Buffet)",
                "Biometric Access",
                "Fitness Gym",
                "Study Cubicles",
                "Elevator",
                "Laundry Service",
                "24/7 Security Guards"
            ],
            "room_options": [
                {
                    "room_type": "2-Sharing AC",
                    "price_monthly": 14000,
                    "security_deposit": 14000,
                    "available_beds": 2,
                    "total_beds": 24,
                    "attached_bathroom": True,
                    "ac_available": True
                },
                {
                    "room_type": "Single Private AC",
                    "price_monthly": 22000,
                    "security_deposit": 22000,
                    "available_beds": 0,
                    "total_beds": 6,
                    "attached_bathroom": True,
                    "ac_available": True
                }
            ],
            "rules": [
                "Entry gate closes at 11:00 PM",
                "ID card mandatory at biometric turnstile"
            ],
            "food_included": True,
            "food_type": "Multi-cuisine buffet (South/North/Continental)",
            "contact_phone": "+91 94401 56789",
            "contact_email": "scholar.zolo@gmail.com",
            "cover_image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800",
            "images": [
                "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800",
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"
            ],
            "verification_status": VerificationStatus.VERIFIED,
            "trust_score": 93,
            "trust_breakdown": {
                "physical_inspection": 95,
                "fire_safety_clearance": 95,
                "police_verification": 90,
                "food_hygiene_fssai": 92,
                "student_feedback_rating": 94
            },
            "documents": [
                {
                    "id": "doc-004",
                    "doc_type": DocumentType.TRADE_LICENSE,
                    "title": "Commercial Trade License",
                    "file_url": "https://docs.ezeestayy.com/mock/trade_zolo.pdf",
                    "status": VerificationStatus.VERIFIED,
                    "uploaded_at": today - timedelta(days=20),
                    "verified_at": today - timedelta(days=18),
                    "notes": "Verified"
                }
            ],
            "avg_rating": 4.7,
            "review_count": 28,
            "created_at": today - timedelta(days=45),
        },
        {
            "id": "hst-hyd-003",
            "owner_id": "usr-owner-001",
            "owner_name": "Venkata Rao",
            "name": "Oxford Elite Student Suites & PG",
            "description": "Quiet, green environment with spacious single and double rooms tailored for students preparing for engineering exams and competitive careers. Proximity to KL University transport point.",
            "city": "Hyderabad",
            "locality": "Bowrampet",
            "address": "Survey 88, Bowrampet Village Road, Hyderabad 500043",
            "gender_type": GenderType.GIRLS,
            "nearby_universities": [
                {"university_name": "KL University Hyderabad", "distance_km": 1.4, "transit_mins": 6},
                {"university_name": "BITS Pilani Hyderabad", "distance_km": 19.0, "transit_mins": 35}
            ],
            "amenities": [
                "200 Mbps WiFi",
                "Pure Vegetarian Meals + Egg options",
                "Air Conditioning",
                "Female Security Guard & Wardens 24/7",
                "CCTV Surveillance on all corridors",
                "Study Desks with LED Lamps",
                "Attached Washroom with Geysers"
            ],
            "room_options": [
                {
                    "room_type": "2-Sharing AC",
                    "price_monthly": 11500,
                    "security_deposit": 11500,
                    "available_beds": 5,
                    "total_beds": 18,
                    "attached_bathroom": True,
                    "ac_available": True
                },
                {
                    "room_type": "3-Sharing AC",
                    "price_monthly": 8500,
                    "security_deposit": 8500,
                    "available_beds": 6,
                    "total_beds": 21,
                    "attached_bathroom": True,
                    "ac_available": True
                }
            ],
            "rules": [
                "Female warden on premises 24/7",
                "Curfew: 9:30 PM"
            ],
            "food_included": True,
            "food_type": "Homestyle South & North Indian Veg Meals",
            "contact_phone": "+91 94401 56789",
            "contact_email": "oxford.suites@ezeestayy.com",
            "cover_image": "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800",
            "images": [
                "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800",
                "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800"
            ],
            "verification_status": VerificationStatus.VERIFIED,
            "trust_score": 91,
            "trust_breakdown": {
                "physical_inspection": 90,
                "fire_safety_clearance": 90,
                "police_verification": 95,
                "food_hygiene_fssai": 90,
                "student_feedback_rating": 90
            },
            "documents": [
                {
                    "id": "doc-005",
                    "doc_type": DocumentType.POLICE_VERIFICATION,
                    "title": "Police Verification Clearance",
                    "file_url": "https://docs.ezeestayy.com/mock/police_oxford.pdf",
                    "status": VerificationStatus.VERIFIED,
                    "uploaded_at": today - timedelta(days=15),
                    "verified_at": today - timedelta(days=14),
                    "notes": "Verified by Cyberabad Police Commissionerate"
                }
            ],
            "avg_rating": 4.6,
            "review_count": 19,
            "created_at": today - timedelta(days=30),
        },
        {
            "id": "hst-blr-001",
            "owner_id": "usr-owner-001",
            "owner_name": "Venkata Rao",
            "name": "Prestige Campus Residences (Near MIT Bengaluru)",
            "description": "State of the art co-living suites in Yelahanka near Manipal Institute of Technology. Features rooftop cafeteria, shuttle bus to campus, fiber internet, and biometric access.",
            "city": "Bengaluru",
            "locality": "Yelahanka / Kogilu Cross",
            "address": "Kogilu Main Road, Yelahanka, Bengaluru, Karnataka 560064",
            "gender_type": GenderType.CO_ED,
            "nearby_universities": [
                {"university_name": "Manipal Institute of Technology - Bengaluru", "distance_km": 2.1, "transit_mins": 8}
            ],
            "amenities": [
                "High-speed WiFi",
                "Campus Shuttle Van",
                "Air Conditioning",
                "Cafeteria (3 Meals)",
                "Gym & Pool Table",
                "Study Pods"
            ],
            "room_options": [
                {
                    "room_type": "2-Sharing AC",
                    "price_monthly": 15500,
                    "security_deposit": 15500,
                    "available_beds": 4,
                    "total_beds": 30,
                    "attached_bathroom": True,
                    "ac_available": True
                }
            ],
            "rules": ["Gate closes at 11:00 PM"],
            "food_included": True,
            "food_type": "North, South Indian & Continental Buffet",
            "contact_phone": "+91 94401 56789",
            "cover_image": "https://images.unsplash.com/photo-1540518614846-7ede433c457b?w=800",
            "images": [
                "https://images.unsplash.com/photo-1540518614846-7ede433c457b?w=800"
            ],
            "verification_status": VerificationStatus.VERIFIED,
            "trust_score": 94,
            "trust_breakdown": {
                "physical_inspection": 95,
                "fire_safety_clearance": 95,
                "police_verification": 92,
                "food_hygiene_fssai": 94,
                "student_feedback_rating": 94
            },
            "documents": [],
            "avg_rating": 4.9,
            "review_count": 42,
            "created_at": today - timedelta(days=50),
        },
        {
            "id": "hst-pune-001",
            "owner_id": "usr-owner-001",
            "owner_name": "Venkata Rao",
            "name": "Greenfield Student Suites (Near COEP Pune)",
            "description": "Centrally located student accommodation near Shivajinagar and Pune station. Ideal for COEP engineering scholars.",
            "city": "Pune",
            "locality": "Shivajinagar",
            "address": "Jangali Maharaj Road, Shivajinagar, Pune, Maharashtra 411005",
            "gender_type": GenderType.BOYS,
            "nearby_universities": [
                {"university_name": "COEP Technological University Pune", "distance_km": 1.2, "transit_mins": 5}
            ],
            "amenities": [
                "Fiber Internet",
                "Maharashtrian & North Indian Meals",
                "Daily Cleaning",
                "CCTV & Biometric Entry"
            ],
            "room_options": [
                {
                    "room_type": "2-Sharing Non-AC",
                    "price_monthly": 10500,
                    "security_deposit": 10500,
                    "available_beds": 3,
                    "total_beds": 16,
                    "attached_bathroom": True,
                    "ac_available": False
                }
            ],
            "rules": ["Entry cutoff: 10:00 PM"],
            "food_included": True,
            "food_type": "Breakfast, Lunch & Dinner",
            "contact_phone": "+91 94401 56789",
            "cover_image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800",
            "images": [
                "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800"
            ],
            "verification_status": VerificationStatus.VERIFIED,
            "trust_score": 88,
            "trust_breakdown": {
                "physical_inspection": 90,
                "fire_safety_clearance": 88,
                "police_verification": 88,
                "food_hygiene_fssai": 86,
                "student_feedback_rating": 88
            },
            "documents": [],
            "avg_rating": 4.5,
            "review_count": 16,
            "created_at": today - timedelta(days=40),
        },
        # Pending verification hostel for admin demo flow
        {
            "id": "hst-hyd-pending",
            "owner_id": "usr-owner-001",
            "owner_name": "Venkata Rao",
            "name": "Sai Balaji Royal Executive PG (New Listing)",
            "description": "Brand new 50-bed PG facility recently constructed near Bachupally with elevator, solar water heater, and AC in every room. Application submitted for official platform verification.",
            "city": "Hyderabad",
            "locality": "Bachupally Main Road",
            "address": "Survey 112/A, Bachupally, Hyderabad 500090",
            "gender_type": GenderType.BOYS,
            "nearby_universities": [
                {"university_name": "KL University Hyderabad", "distance_km": 3.2, "transit_mins": 10}
            ],
            "amenities": [
                "High-speed WiFi",
                "Air Conditioning",
                "3 Meals Daily",
                "Elevator",
                "Solar Geysers"
            ],
            "room_options": [
                {
                    "room_type": "2-Sharing AC",
                    "price_monthly": 11000,
                    "security_deposit": 11000,
                    "available_beds": 12,
                    "total_beds": 30,
                    "attached_bathroom": True,
                    "ac_available": True
                }
            ],
            "rules": ["Gate closes at 10:30 PM"],
            "food_included": True,
            "food_type": "South Indian Veg & Non-Veg",
            "contact_phone": "+91 94401 56789",
            "cover_image": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
            "images": [
                "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800"
            ],
            "verification_status": VerificationStatus.PENDING,
            "trust_score": 60,
            "trust_breakdown": {
                "physical_inspection": 0,
                "fire_safety_clearance": 75,
                "police_verification": 75,
                "food_hygiene_fssai": 70,
                "student_feedback_rating": 80
            },
            "documents": [
                {
                    "id": "doc-pending-01",
                    "doc_type": DocumentType.TRADE_LICENSE,
                    "title": "GHMC Trade License Application",
                    "file_url": "https://docs.ezeestayy.com/mock/saibalaji_trade.pdf",
                    "status": VerificationStatus.PENDING,
                    "uploaded_at": today - timedelta(days=2),
                    "notes": "Awaiting admin team document review"
                },
                {
                    "id": "doc-pending-02",
                    "doc_type": DocumentType.FIRE_SAFETY,
                    "title": "Fire NOC Certificate Copy",
                    "file_url": "https://docs.ezeestayy.com/mock/saibalaji_fire.pdf",
                    "status": VerificationStatus.PENDING,
                    "uploaded_at": today - timedelta(days=2),
                    "notes": "Awaiting verification"
                }
            ],
            "avg_rating": 4.2,
            "review_count": 3,
            "created_at": today - timedelta(days=3),
        }
    ]
    await db.hostels.insert_many(hostels)

    # ----------------------------------------------------
    # 4. Seed Essentials Bundles & Catalog
    # ----------------------------------------------------
    bundles = [
        {
            "id": "bdl-relocation-super",
            "title": "Ultimate Day-1 Relocation Super Bundle",
            "subtitle": "Complete all-in-one move-in kit. Covers your entire dorm setup from Day 1.",
            "category": EssentialsCategory.BUNDLE,
            "price_inr": 5499,
            "original_price_inr": 8100,
            "savings_inr": 2601,
            "badge": "Most Popular (Save 32%)",
            "image_url": "https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?w=600",
            "items_included": [
                "Quilted Mattress Protector & 2 Pure Cotton Single Bedsheets with Pillow Covers",
                "Microfiber Plush Sleeping Pillow + Light All-Season Microfiber Quilt/Dohar",
                "Quick-Dry Turkish Cotton Bath Towel & Hand Towel",
                "Eye-Care LED Desk Study Lamp (Touch Dimming, 3 Color Modes)",
                "4-Socket Surge Protected Extension Cord (2m Cable + USB Ports)",
                "1.5L Auto-Cutoff Stainless Steel Electric Kettle for Tea/Noodles",
                "Borosil Insulated Stainless Steel Water Flask (750ml, 24hr Cold/Hot)",
                "Dorm Bath & Laundry Kit (Heavy Duty Bucket, Mug, 12 Hangers & Hamper)"
            ],
            "description": "The ultimate stress-saver. Delivered sanitised and placed inside your assigned PG room before you even reach the city."
        },
        {
            "id": "bdl-starter-bed-bath",
            "title": "Dorm Starter Bed & Bath Pack",
            "subtitle": "Soft breathable linens, plush pillow, all-season comforter & bath set.",
            "category": EssentialsCategory.BEDDING_BATH,
            "price_inr": 2999,
            "original_price_inr": 4200,
            "savings_inr": 1201,
            "badge": "Dorm Essential",
            "image_url": "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=600",
            "items_included": [
                "2 Pure Cotton Single Bedsheets + Matching Pillow Covers",
                "Plush Microfiber Sleeping Pillow",
                "All-Season Breathable AC Blanket / Dohar",
                "1 Large Bath Towel (100% Ring Spun Cotton) + 1 Face Towel",
                "Waterproof Mattress Protector"
            ],
            "description": "Sleep comfortably from Night 1 without carrying bulky bedsheets and pillows in your luggage."
        },
        {
            "id": "bdl-study-tech",
            "title": "College Study & Tech Productivity Kit",
            "subtitle": "Ergonomic study setup for engineering, coding, and late-night assignments.",
            "category": EssentialsCategory.STUDY_TECH,
            "price_inr": 1899,
            "original_price_inr": 2650,
            "savings_inr": 751,
            "badge": "Student Choice",
            "image_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600",
            "items_included": [
                "Foldable Eye-Care LED Study Lamp with Mobile Stand",
                "Spike Buster 4-Socket Extension Board with Fast Charging USB Ports",
                "Foldable Ergonomic Laptop Riser / Stand",
                "Multi-Compartment Desk Organizer & Cable Management Clips"
            ],
            "description": "Engineered for student study desks to keep your gadgets powered and your posture comfortable."
        },
        {
            "id": "bdl-kitchenette",
            "title": "Dorm Kitchenette & Snacks Pack",
            "subtitle": "Electric kettle, insulated flask, micro-safe bowls, and cutlery set.",
            "category": EssentialsCategory.KITCHENETTE,
            "price_inr": 1499,
            "original_price_inr": 2100,
            "savings_inr": 601,
            "badge": "Late Night Fuel",
            "image_url": "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600",
            "items_included": [
                "1.5L Stainless Steel Auto-Shutoff Electric Kettle",
                "750ml Vacuum Insulated Thermosteel Water Flask",
                "Stainless Steel Cutlery Set with Hygienic Travel Case",
                "Microwave-Safe Ceramic Mug & Cereal Bowl"
            ],
            "description": "Essential for late night exam tea, instant noodles, and hot drinking water."
        }
    ]
    await db.essentials_bundles.insert_many(bundles)

    items = [
        {
            "id": "itm-bedsheet-cotton",
            "name": "100% Pure Cotton Single Bedsheet with Pillow Cover",
            "description": "Breathable 220 TC single bedsheet tailored for hostel single/twin mattresses.",
            "category": EssentialsCategory.BEDDING_BATH,
            "price_inr": 599,
            "original_price_inr": 899,
            "image_url": "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=400",
            "in_stock": True,
            "rating": 4.8,
            "features": ["100% Combed Cotton", "Fade Resistant", "Machine Washable"]
        },
        {
            "id": "itm-study-lamp",
            "name": "Rechargeable LED Desk Lamp with 3 Color Modes",
            "description": "Eye-comfort LED light with brightness dimmer and phone holder base.",
            "category": EssentialsCategory.STUDY_TECH,
            "price_inr": 699,
            "original_price_inr": 1099,
            "image_url": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400",
            "in_stock": True,
            "rating": 4.9,
            "features": ["Warm/White/Natural Light", "Touch Switch", "USB Rechargeable"]
        },
        {
            "id": "itm-extension-board",
            "name": "Surge Protector 4-Socket Extension Board with 2 USB",
            "description": "Heavy duty fire-retardant extension board with 2.5m copper wire.",
            "category": EssentialsCategory.STUDY_TECH,
            "price_inr": 549,
            "original_price_inr": 799,
            "image_url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400",
            "in_stock": True,
            "rating": 4.8,
            "features": ["Surge Protection", "Universal Sockets", "Individual Switches"]
        },
        {
            "id": "itm-kettle",
            "name": "Pigeon 1.5L Stainless Steel Electric Kettle",
            "description": "Fast boiling 1500W electric kettle with auto-cutoff and cool-touch handle.",
            "category": EssentialsCategory.KITCHENETTE,
            "price_inr": 699,
            "original_price_inr": 1195,
            "image_url": "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400",
            "in_stock": True,
            "rating": 4.7,
            "features": ["Fast 3-min Boil", "Stainless Steel 304", "Auto Shutoff"]
        },
        {
            "id": "itm-bath-bucket-kit",
            "name": "Dorm Hygiene & Laundry Kit",
            "description": "20L Sturdy plastic bucket, matching mug, 12 unbreakable cloth hangers, and mesh laundry bag.",
            "category": EssentialsCategory.HYGIENE_CLEANING,
            "price_inr": 599,
            "original_price_inr": 850,
            "image_url": "https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?w=400",
            "in_stock": True,
            "rating": 4.8,
            "features": ["Heavy Duty Plastic", "Space-Saving", "Complete Day-1 Essentials"]
        }
    ]
    await db.essentials_catalog.insert_many(items)

    # ----------------------------------------------------
    # 5. Seed Demo Relocation Journey for Aarav Sharma
    # ----------------------------------------------------
    # Booking
    demo_booking = {
        "id": "bk-demo-001",
        "booking_reference": "EZB-2026-8912",
        "student_id": "usr-student-001",
        "student_name": "Aarav Sharma",
        "student_email": "student@ezeestayy.com",
        "student_phone": "+91 98765 43210",
        "hostel_id": "hst-hyd-001",
        "hostel_name": "Stanza Living - Kyoto House (Verified Student PG)",
        "hostel_city": "Hyderabad",
        "hostel_locality": "Bowrampet / Gandipet Main Road",
        "hostel_address": "Plot 42-45, Near KL University Campus Road, Hyderabad",
        "owner_id": "usr-owner-001",
        "room_type": "2-Sharing AC",
        "monthly_rent": 12500,
        "security_deposit": 12500,
        "move_in_date": move_in_date_str,
        "duration_months": 10,
        "status": BookingStatus.CONFIRMED,
        "special_requests": "Upper floor room with study desk near window if possible",
        "response_notes": "Room 304 reserved for Aarav Sharma.",
        "created_at": today - timedelta(days=6),
        "confirmed_at": today - timedelta(days=5),
    }
    await db.bookings.insert_one(demo_booking)

    # Logistics Order
    demo_logistics = {
        "id": "log-demo-001",
        "tracking_number": "EZL-HYD-88219",
        "student_id": "usr-student-001",
        "student_name": "Aarav Sharma",
        "student_phone": "+91 98765 43210",
        "origin_city": "Visakhapatnam",
        "origin_address": "Flat 302, Sagar Residency, MVP Colony, Visakhapatnam 530017",
        "origin_pincode": "530017",
        "destination_city": "Hyderabad",
        "destination_hostel_id": "hst-hyd-001",
        "destination_hostel_name": "Stanza Living - Kyoto House",
        "destination_address": "Plot 42-45, Near KL University Campus Road, Bowrampet, Hyderabad 500075",
        "destination_pincode": "500075",
        "packages": [
            {"package_type": PackageType.BOX_MEDIUM, "label": "Wardrobe, Books & Stationery", "weight_kg": 22.5, "quantity": 1},
            {"package_type": PackageType.BOX_SMALL, "label": "Tech Accessories & Footwear", "weight_kg": 12.0, "quantity": 1}
        ],
        "total_weight_kg": 34.5,
        "pickup_date": (today - timedelta(days=2)).strftime("%Y-%m-%d"),
        "estimated_delivery_date": (today + timedelta(days=5)).strftime("%Y-%m-%d"), # 2 days before move-in!
        "is_express": False,
        "total_cost_inr": 1850,
        "status": LogisticsStatus.IN_TRANSIT,
        "checkpoints": [
            {
                "status": LogisticsStatus.BOOKED,
                "location": "Visakhapatnam Hub",
                "description": "Logistics order booked and shipment tag generated.",
                "timestamp": today - timedelta(days=3, hours=4)
            },
            {
                "status": LogisticsStatus.PICKED_UP,
                "location": "MVP Colony, Visakhapatnam",
                "description": "Doorstep pickup completed by EzeeStayy logistics partner.",
                "timestamp": today - timedelta(days=2, hours=10)
            },
            {
                "status": LogisticsStatus.IN_TRANSIT,
                "location": "Vijayawada Transit Sorting Hub",
                "description": "Consignment sorted and dispatched on express highway line-haul towards Hyderabad Central Hub.",
                "timestamp": today - timedelta(days=1, hours=2)
            }
        ],
        "created_at": today - timedelta(days=3),
    }
    await db.logistics.insert_one(demo_logistics)

    # Essentials Order
    demo_essentials_order = {
        "id": "ess-demo-001",
        "order_reference": "EZK-2026-4421",
        "student_id": "usr-student-001",
        "student_name": "Aarav Sharma",
        "items": [
            {
                "item_id": "bdl-starter-bed-bath",
                "item_type": "bundle",
                "title": "Dorm Starter Bed & Bath Pack",
                "price_inr": 2999,
                "quantity": 1
            },
            {
                "item_id": "itm-study-lamp",
                "item_type": "item",
                "title": "Rechargeable LED Desk Lamp with 3 Color Modes",
                "price_inr": 699,
                "quantity": 1
            }
        ],
        "total_amount_inr": 3698,
        "delivery_address": "Room 304, Stanza Living Kyoto House, Bowrampet, Hyderabad 500075",
        "delivery_city": "Hyderabad",
        "destination_hostel_id": "hst-hyd-001",
        "scheduled_delivery_date": move_in_date_str,
        "status": EssentialsOrderStatus.PACKED,
        "contact_phone": "+91 98765 43210",
        "created_at": today - timedelta(days=2),
    }
    await db.essentials_orders.insert_one(demo_essentials_order)

    # Calculate AI readiness score
    booking_context = {
        "status": "confirmed",
        "hostel_verified": True,
        "hostel_name": "Stanza Living - Kyoto House",
        "confirmed_at": (today - timedelta(days=5)).strftime("%Y-%m-%d")
    }
    logistics_context = {
        "status": "in_transit",
        "tracking_number": "EZL-HYD-88219",
        "estimated_delivery_date": (today + timedelta(days=5)).strftime("%Y-%m-%d"),
        "created_at": (today - timedelta(days=3)).strftime("%Y-%m-%d")
    }
    essentials_context = {
        "status": "packed",
        "order_reference": "EZK-2026-4421",
        "created_at": (today - timedelta(days=2)).strftime("%Y-%m-%d")
    }

    breakdown, milestones, alerts = calculate_readiness(
        target_university="KL University Hyderabad",
        target_city="Hyderabad",
        move_in_date_str=move_in_date_str,
        booking_data=booking_context,
        logistics_data=logistics_context,
        essentials_data=essentials_context,
    )

    demo_journey = {
        "id": "jrn-demo-001",
        "student_id": "usr-student-001",
        "student_name": "Aarav Sharma",
        "student_email": "student@ezeestayy.com",
        "student_phone": "+91 98765 43210",
        "target_university": "KL University Hyderabad",
        "target_city": "Hyderabad",
        "origin_city": "Visakhapatnam",
        "move_in_date": move_in_date_str,
        "booking_id": "bk-demo-001",
        "hostel_id": "hst-hyd-001",
        "hostel_name": "Stanza Living - Kyoto House (Verified Student PG)",
        "hostel_verified": True,
        "booking_status": "confirmed",
        "logistics_order_id": "log-demo-001",
        "logistics_status": "in_transit",
        "logistics_eta": (today + timedelta(days=5)).strftime("%Y-%m-%d"),
        "essentials_order_id": "ess-demo-001",
        "essentials_status": "packed",
        "essentials_eta": move_in_date_str,
        "readiness": breakdown.model_dump(),
        "milestones": [m.model_dump() for m in milestones],
        "alerts": [a.model_dump() for a in alerts],
        "updated_at": today,
    }
    await db.journeys.insert_one(demo_journey)

    # Journey for high-risk student Priya Reddy (2 days left, no booking confirmed)
    priya_move_in = (today + timedelta(days=2)).strftime("%Y-%m-%d")
    p_breakdown, p_milestones, p_alerts = calculate_readiness(
        target_university="IIT Hyderabad",
        target_city="Hyderabad",
        move_in_date_str=priya_move_in,
        booking_data={"status": "not_started", "hostel_verified": False},
        logistics_data={"status": "not_started"},
        essentials_data={"status": "not_started"},
    )
    priya_journey = {
        "id": "jrn-priya-002",
        "student_id": "usr-student-002",
        "student_name": "Priya Reddy",
        "student_email": "priya.reddy@gmail.com",
        "student_phone": "+91 98111 22334",
        "target_university": "IIT Hyderabad",
        "target_city": "Hyderabad",
        "origin_city": "Vijayawada",
        "move_in_date": priya_move_in,
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
        "readiness": p_breakdown.model_dump(),
        "milestones": [m.model_dump() for m in p_milestones],
        "alerts": [a.model_dump() for a in p_alerts],
        "updated_at": today,
    }
    await db.journeys.insert_one(priya_journey)

    # ----------------------------------------------------
    # 6. Seed Reviews
    # ----------------------------------------------------
    reviews = [
        {
            "id": "rev-001",
            "hostel_id": "hst-hyd-001",
            "student_id": "usr-student-past1",
            "student_name": "Siddharth Verma (KL University CSE 3rd Year)",
            "rating": 5,
            "cleanliness_rating": 5,
            "food_rating": 5,
            "safety_rating": 5,
            "wifi_rating": 5,
            "comment": "Best PG in Bowrampet. The bus connectivity to KL University is seamless (takes 5 mins), food is genuinely hygienic and WiFi never drops during assignment submissions.",
            "room_type_stayed": "2-Sharing AC",
            "verified_resident": True,
            "created_at": today - timedelta(days=40),
        },
        {
            "id": "rev-002",
            "hostel_id": "hst-hyd-001",
            "student_id": "usr-student-past2",
            "student_name": "Nikhil Reddy (ECE Batch 2025)",
            "rating": 5,
            "cleanliness_rating": 5,
            "food_rating": 4,
            "safety_rating": 5,
            "wifi_rating": 5,
            "comment": "Great study room on the terrace. Security and biometric check-ins are very strict which makes parents very comfortable.",
            "room_type_stayed": "Single Private AC",
            "verified_resident": True,
            "created_at": today - timedelta(days=25),
        },
        {
            "id": "rev-003",
            "hostel_id": "hst-hyd-002",
            "student_id": "usr-student-past3",
            "student_name": "Aditya Rao (IIIT-H M.Tech)",
            "rating": 5,
            "cleanliness_rating": 5,
            "food_rating": 4,
            "safety_rating": 5,
            "wifi_rating": 5,
            "comment": "Walking distance from IIIT Hyderabad campus. Quiet rooms with great study desks and AC.",
            "room_type_stayed": "2-Sharing AC",
            "verified_resident": True,
            "created_at": today - timedelta(days=20),
        }
    ]
    await db.reviews.insert_many(reviews)

    logger.info("Database seeding completed successfully!")
