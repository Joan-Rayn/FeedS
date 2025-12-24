from loguru import logger
from sqlalchemy.orm import Session
from ..models import AuditLog
from ..core.database import get_db

def log_action(db: Session, user_id: int, action: str, details: str = None):
    """Log an audit action"""
    audit_log = AuditLog(
        user_id=user_id,
        action=action,
        details=details
    )
    db.add(audit_log)
    db.commit()
    logger.info(f"Audit: User {user_id} performed action '{action}' - {details}")

def setup_logging():
    """Setup logging configuration"""
    logger.add(
        "logs/audit.log",
        rotation="1 day",
        retention="30 days",
        level="INFO",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {message}"
    )
    logger.add(
        "logs/error.log",
        rotation="1 day",
        retention="30 days",
        level="ERROR",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {message}"
    )