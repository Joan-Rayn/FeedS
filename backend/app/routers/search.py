from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from ..core.database import get_db
from ..models import Feedback, Category, User
from ..schemas import Feedback as FeedbackSchema
from ..utils.auth import get_current_active_user

router = APIRouter()

@router.get("/search", response_model=List[FeedbackSchema])
def search_feedbacks(
    q: str = Query(..., min_length=1, description="Search query"),
    category_id: int = None,
    status: str = None,
    priority: str = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Full-text search in feedbacks"""
    query = db.query(Feedback).join(Category).join(User)

    # Full-text search in title and description
    if q:
        search_term = f"%{q}%"
        query = query.filter(
            or_(
                Feedback.title.ilike(search_term),
                Feedback.description.ilike(search_term),
                Category.name.ilike(search_term),
                User.nom.ilike(search_term),
                User.prenom.ilike(search_term)
            )
        )

    # Apply filters
    if category_id:
        query = query.filter(Feedback.category_id == category_id)
    if status:
        query = query.filter(Feedback.status == status)
    if priority:
        query = query.filter(Feedback.priority == priority)

    # Apply permissions
    if current_user.role == "etudiant":
        query = query.filter(Feedback.user_id == current_user.id)
    elif current_user.role == "personnel":
        # Personnel can see feedbacks from their category or assigned to them
        pass  # For now, allow all

    feedbacks = query.offset(skip).limit(limit).all()
    return feedbacks

@router.get("/autocomplete")
def autocomplete_search(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Autocomplete suggestions for search"""
    if len(q) < 2:
        return {"suggestions": []}

    # Search in categories
    categories = db.query(Category.name).filter(Category.name.ilike(f"{q}%")).limit(5).all()

    # Search in feedback titles
    titles = db.query(Feedback.title).filter(Feedback.title.ilike(f"{q}%")).limit(5).all()

    suggestions = []
    suggestions.extend([cat.name for cat in categories])
    suggestions.extend([title.title for title in titles])

    return {"suggestions": list(set(suggestions))[:10]}