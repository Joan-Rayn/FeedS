from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..models import AuditLog as AuditLogModel, User
from ..schemas import AuditLog as AuditLogSchema
from ..utils.auth import get_current_active_user

router = APIRouter()

@router.get("/", response_model=List[AuditLogSchema])
def read_audit_logs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to view audit logs")

    audit_logs = db.query(AuditLogModel).offset(skip).limit(limit).all()
    return audit_logs

@router.get("/user/{user_id}", response_model=List[AuditLogSchema])
def read_user_audit_logs(
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to view these audit logs")

    audit_logs = db.query(AuditLogModel).filter(AuditLogModel.user_id == user_id).offset(skip).limit(limit).all()
    return audit_logs