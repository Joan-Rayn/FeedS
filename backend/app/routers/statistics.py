from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..core.database import get_db
from ..models import Feedback, User, Category
from ..utils.auth import get_current_admin_user

router = APIRouter()

@router.get("/stats")
def get_statistics(db: Session = Depends(get_db), current_user = Depends(get_current_admin_user)):
    total_feedbacks = db.query(func.count(Feedback.id)).scalar()
    open_feedbacks = db.query(func.count(Feedback.id)).filter(Feedback.status == "open").scalar()
    in_progress_feedbacks = db.query(func.count(Feedback.id)).filter(Feedback.status == "in_progress").scalar()
    resolved_feedbacks = db.query(func.count(Feedback.id)).filter(Feedback.status == "resolved").scalar()
    closed_feedbacks = db.query(func.count(Feedback.id)).filter(Feedback.status == "closed").scalar()
    total_users = db.query(func.count(User.id)).scalar()
    students = db.query(func.count(User.id)).filter(User.role == "etudiant").scalar()
    staff = db.query(func.count(User.id)).filter(User.role == "personnel").scalar()
    admins = db.query(func.count(User.id)).filter(User.role == "admin").scalar()
    total_categories = db.query(func.count(Category.id)).scalar()
    
    # Category stats
    category_stats = db.query(Category.name, func.count(Feedback.id)).join(Feedback).group_by(Category.id).all()
    category_data = [{"name": name, "count": count} for name, count in category_stats]
    
    return {
        "total_feedbacks": total_feedbacks,
        "open_feedbacks": open_feedbacks,
        "in_progress_feedbacks": in_progress_feedbacks,
        "resolved_feedbacks": resolved_feedbacks,
        "closed_feedbacks": closed_feedbacks,
        "total_users": total_users,
        "students": students,
        "staff": staff,
        "admins": admins,
        "total_categories": total_categories,
        "category_stats": category_data
    }