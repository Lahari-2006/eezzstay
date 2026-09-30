import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "EzeeStayy Integrated Student Relocation Platform"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Security & Gating
    # DEMO_MODE defaults to False for safety. Gated strictly for live security.
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "false").strip().lower() in ("true", "1", "t", "yes", "y")
    
    # JWT Settings
    JWT_SECRET: str = os.getenv("JWT_SECRET", "ezeestayy_production_secret_key_relo_2026_983719482")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # MongoDB Settings
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "ezeestayy_db")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ]

    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=".env",
        extra="allow"
    )

settings = Settings()
