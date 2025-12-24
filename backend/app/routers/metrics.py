from fastapi import APIRouter, Depends, Response
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from ..core.database import get_db
from sqlalchemy import func, text
from ..models import Feedback, User, Category, Notification

router = APIRouter()

@router.get("/metrics")
def get_metrics():
    """Prometheus metrics endpoint"""
    return Response(
        generate_latest(),
        media_type=CONTENT_TYPE_LATEST
    )

@router.get("/health")
def health_check(db = Depends(get_db)):
    """Health check endpoint"""
    try:
        # Test database connection
        db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}

@router.get("/stats")
def get_stats(db = Depends(get_db)):
    """Application statistics"""
    try:
        total_users = db.query(func.count(User.id)).scalar()
        total_feedbacks = db.query(func.count(Feedback.id)).scalar()
        total_categories = db.query(func.count(Category.id)).scalar()
        open_feedbacks = db.query(func.count(Feedback.id)).filter(Feedback.status == "open").scalar()
        resolved_feedbacks = db.query(func.count(Feedback.id)).filter(Feedback.status == "resolved").scalar()

        return {
            "total_users": total_users,
            "total_feedbacks": total_feedbacks,
            "total_categories": total_categories,
            "open_feedbacks": open_feedbacks,
            "resolved_feedbacks": resolved_feedbacks,
            "resolution_rate": round((resolved_feedbacks / total_feedbacks * 100), 2) if total_feedbacks > 0 else 0
        }
    except Exception as e:
        return {"error": str(e)}