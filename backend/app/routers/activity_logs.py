from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from ..core.database import get_db
from ..models import ActivityLog, User
from ..schemas import ActivityLogResponse
from ..utils.auth import get_current_user
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/activity-logs", tags=["activity-logs"])

class ActivityLogResponse(BaseModel):
    id: int
    user_id: int
    user_name: str
    user_role: str
    activity_type: str
    description: str
    ip_address: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

@router.get("/", response_model=List[ActivityLogResponse])
async def get_activity_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    user_id: Optional[int] = None,
    activity_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get activity logs with filtering options.
    Admin can see all logs, others can only see their own logs.
    """
    query = db.query(ActivityLog).join(User)

    # Filter based on user role
    if current_user.role != "admin":
        query = query.filter(ActivityLog.user_id == current_user.id)

    # Additional filters
    if user_id:
        if current_user.role != "admin":
            raise HTTPException(status_code=403, detail="Not authorized to filter by user")
        query = query.filter(ActivityLog.user_id == user_id)

    if activity_type:
        query = query.filter(ActivityLog.activity_type == activity_type)

    logs = (
        query.order_by(desc(ActivityLog.created_at))
        .offset(skip)
        .limit(limit)
        .all()
    )

    return [
        ActivityLogResponse(
            id=log.id,
            user_id=log.user_id,
            user_name=f"{log.user.prenom} {log.user.nom}",
            user_role=log.user.role.value,
            activity_type=log.activity_type.value,
            description=log.description,
            ip_address=log.ip_address,
            created_at=log.created_at
        )
        for log in logs
    ]

@router.get("/recent", response_model=List[ActivityLogResponse])
async def get_recent_activity_logs(
    limit: int = Query(5, ge=1, le=20),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get recent activity logs for dashboard display.
    Admin sees all recent logs, others see only their own.
    """
    query = db.query(ActivityLog).join(User)

    if current_user.role != "admin":
        query = query.filter(ActivityLog.user_id == current_user.id)

    logs = (
        query.order_by(desc(ActivityLog.created_at))
        .limit(limit)
        .all()
    )

    return [
        ActivityLogResponse(
            id=log.id,
            user_id=log.user_id,
            user_name=f"{log.user.prenom} {log.user.nom}",
            user_role=log.user.role.value,
            activity_type=log.activity_type.value,
            description=log.description,
            ip_address=log.ip_address,
            created_at=log.created_at
        )
        for log in logs
    ]