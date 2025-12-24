from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    app_name: str = "FeedS API"
    debug: bool = False
    version: str = "1.0.0"
    api_v1_prefix: str = "/api/v1"

    # Use PostgreSQL if `DATABASE_URL` is provided, otherwise default to
    # a local SQLite file for development. During deployment set
    # `DATABASE_URL` to your production Postgres connection string.
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./feeds_dev.db")

    secret_key: str = os.getenv("SECRET_KEY", "supersecretkey")
    algorithm: str = os.getenv("ALGORITHM", "HS256")
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    refresh_token_expire_days: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:5173", "http://localhost:5176"]

    upload_directory: str = os.getenv("UPLOAD_DIRECTORY", "uploads")
    max_upload_size: int = int(os.getenv("MAX_UPLOAD_SIZE", "10485760"))

    smtp_server: str = os.getenv("SMTP_SERVER", "")
    smtp_port: int = int(os.getenv("SMTP_PORT", "587"))
    smtp_username: str = os.getenv("SMTP_USERNAME", "")
    smtp_password: str = os.getenv("SMTP_PASSWORD", "")

    # Redis Cache Configuration
    redis_host: str = os.getenv("REDIS_HOST", "localhost")
    redis_port: int = int(os.getenv("REDIS_PORT", "6379"))
    redis_db: int = int(os.getenv("REDIS_DB", "0"))
    redis_password: str = os.getenv("REDIS_PASSWORD", "")
    redis_cache_ttl: int = int(os.getenv("REDIS_CACHE_TTL", "300"))

    # Monitoring & Analytics
    sentry_dsn: str = os.getenv("SENTRY_DSN", "")
    enable_metrics: bool = os.getenv("ENABLE_METRICS", "true").lower() == "true"
    log_level: str = os.getenv("LOG_LEVEL", "INFO")

    # Security
    bcrypt_rounds: int = int(os.getenv("BCRYPT_ROUNDS", "12"))
    rate_limit_requests: int = int(os.getenv("RATE_LIMIT_REQUESTS", "100"))
    rate_limit_window: int = int(os.getenv("RATE_LIMIT_WINDOW", "60"))

    # External Services
    enable_email: bool = os.getenv("ENABLE_EMAIL", "false").lower() == "true"

    class Config:
        env_file = ".env"

settings = Settings()