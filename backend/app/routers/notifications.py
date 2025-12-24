from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..models import Notification as NotificationModel
from ..schemas import Notification as NotificationSchema
from ..utils.auth import get_current_active_user

router = APIRouter()

@router.get("/", response_model=List[NotificationSchema])
def read_notifications(db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    notifications = db.query(NotificationModel).filter(NotificationModel.user_id == current_user.id).all()
    return notifications

@router.put("/{notification_id}/read")
def mark_as_read(notification_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    notification = db.query(NotificationModel).filter(NotificationModel.id == notification_id, NotificationModel.user_id == current_user.id).first()
    if notification is None:
        raise HTTPException(status_code=404, detail="Notification not found")
    notification.is_read = True
    db.commit()
    return {"message": "Notification marked as read"}