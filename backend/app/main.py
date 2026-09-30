import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db, close_db, get_db
from app.services.seed_data import seed_database
from app.routes import (
    auth,
    hostels,
    bookings,
    logistics,
    essentials,
    journeys,
    admin,
    universities,
    reviews,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("ezeestayy")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}...")
    logger.info(f"Security: DEMO_MODE = {settings.DEMO_MODE}")
    db = await init_db()

    # Automatically check if seed data is needed
    user_count = await db.users.count_documents({})
    if user_count == 0:
        logger.info("Empty database detected. Auto-seeding initial migration ecosystem data...")
        await seed_database()
    else:
        logger.info(f"Database already populated ({user_count} users found).")

    yield

    # Shutdown
    logger.info("Shutting down EzeeStayy application...")
    await close_db()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Integrated Student Relocation & AI Readiness Command Center Platform",
    lifespan=lifespan,
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(hostels.router, prefix=settings.API_PREFIX)
app.include_router(bookings.router, prefix=settings.API_PREFIX)
app.include_router(logistics.router, prefix=settings.API_PREFIX)
app.include_router(essentials.router, prefix=settings.API_PREFIX)
app.include_router(journeys.router, prefix=settings.API_PREFIX)
app.include_router(admin.router, prefix=settings.API_PREFIX)
app.include_router(universities.router, prefix=settings.API_PREFIX)
app.include_router(reviews.router, prefix=settings.API_PREFIX)

@app.get("/")
async def root():
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "operational",
        "demo_mode": settings.DEMO_MODE,
        "docs_url": "/docs",
        "command_center": "Ready",
    }

@app.get("/api/health")
async def health_check():
    db = get_db()
    db_status = "connected" if db is not None else "disconnected"
    return {
        "status": "healthy",
        "database": db_status,
        "demo_mode_enabled": settings.DEMO_MODE,
    }

@app.post("/api/seed", tags=["Development"])
async def trigger_seed():
    """Manual re-seed endpoint for demo resetting."""
    await seed_database()
    return {"message": "Database re-seeded successfully with fresh demo and catalog data."}
