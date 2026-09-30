import logging
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

logger = logging.getLogger(__name__)

client = None
db = None
is_mock_db = False

async def init_db():
    global client, db, is_mock_db
    try:
        # Attempt to connect to real MongoDB with short timeout
        logger.info(f"Connecting to MongoDB at {settings.MONGODB_URI}...")
        real_client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=2000,
            connectTimeoutMS=2000
        )
        # Test connection with ping
        await real_client.admin.command('ping')
        client = real_client
        db = client[settings.DATABASE_NAME]
        is_mock_db = False
        logger.info("Successfully connected to live MongoDB instance.")
    except Exception as e:
        logger.warning(f"Live MongoDB connection failed ({e}). Falling back to AsyncMongoMockClient in-memory database.")
        try:
            from mongomock_motor import AsyncMongoMockClient
            client = AsyncMongoMockClient()
            db = client[settings.DATABASE_NAME]
            is_mock_db = True
            logger.info("AsyncMongoMockClient in-memory database initialized successfully.")
        except Exception as mock_err:
            logger.error(f"Failed to initialize mock database: {mock_err}")
            raise mock_err

    # Create Indexes for fast lookups
    try:
        await db.users.create_index("email", unique=True)
        await db.hostels.create_index("city")
        await db.hostels.create_index("verification_status")
        await db.bookings.create_index("student_id")
        await db.logistics.create_index("student_id")
        await db.essentials_orders.create_index("student_id")
        await db.journeys.create_index("student_id", unique=True)
        await db.universities.create_index("slug", unique=True)
    except Exception as idx_err:
        logger.warning(f"Index creation notice: {idx_err}")

    return db

async def close_db():
    global client
    if client:
        client.close()
        logger.info("MongoDB client connection closed.")

def get_db():
    global db
    return db
