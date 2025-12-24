from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import Settings
import logging
import os

logger = logging.getLogger(__name__)

settings = Settings()

# Support SQLite for local development (file-based) and PostgreSQL in production.
database_url = settings.database_url or os.getenv("DATABASE_URL", "sqlite:///./feeds_dev.db")

try:
    if database_url.startswith("sqlite"):
        # SQLite needs a special connect_args to allow usage with multiple threads
        engine = create_engine(database_url, connect_args={"check_same_thread": False})
    else:
        engine = create_engine(database_url)
    # Test the connection. In development (sqlite or debug enabled) we
    # log a warning on failure but allow the app to start so the developer
    # can iterate locally. In production (non-sqlite and debug=False)
    # we re-raise the exception to fail fast.
    try:
        with engine.connect() as conn:
            logger.info("Database connection successful.")
    except Exception as e:
        # If using sqlite (file-based) or debug flag is true, don't crash the app.
        if database_url.startswith("sqlite") or getattr(settings, 'debug', False):
            logger.warning(f"Could not connect to database (continuing in dev): {e}")
        else:
            logger.error(f"Failed to connect to database: {e}")
            raise
except Exception as e:
    # Any unexpected error creating the engine should be raised.
    logger.error(f"Database engine setup failed: {e}")
    raise

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()