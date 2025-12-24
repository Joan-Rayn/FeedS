from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import os
import shutil
from ..core.database import get_db
from ..core.config import settings
from ..core.cache import cached
from ..models import Feedback as FeedbackModel, Attachment, AuditLog, UserRole, Notification, User, Response as ResponseModel
from ..schemas import Feedback as FeedbackSchema, FeedbackCreate, FeedbackUpdate, Attachment as AttachmentSchema, ResponseCreate, Response as ResponseSchema
from ..utils.auth import get_current_active_user
from ..utils.file_validation import validate_file_upload, get_secure_filename
from ..utils.audit import log_action
from ..routers.realtime import send_notification_to_user

router = APIRouter()

@router.get("/", response_model=List[FeedbackSchema])
# @cached(expire=300, key_prefix="feedbacks_list")  # Commenté car fonction non-async
def read_feedbacks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    feedbacks = db.query(FeedbackModel).offset(skip).limit(limit).all()
    return feedbacks

@router.get("/{feedback_id}", response_model=FeedbackSchema)
# @cached(expire=600, key_prefix="feedback_detail")  # Commenté car fonction non-async
def read_feedback(feedback_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    feedback = db.query(FeedbackModel).filter(FeedbackModel.id == feedback_id).first()
    if feedback is None:
        raise HTTPException(status_code=404, detail="Feedback not found")
    return feedback

@router.post("/", response_model=FeedbackSchema)
def create_feedback(feedback: FeedbackCreate, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    db_feedback = FeedbackModel(**feedback.dict(), user_id=current_user.id)
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)

    # Audit log
    log_action(db, current_user.id, "create_feedback", f"Created feedback {db_feedback.id}")

    # Notification for admins/personnel
    admins = db.query(User).filter(User.role.in_([UserRole.ADMIN, UserRole.PERSONNEL])).all()
    for admin in admins:
        notif = Notification(
            user_id=admin.id,
            title="Nouveau feedback",
            message=f"Nouveau feedback soumis: {db_feedback.title}"
        )
        db.add(notif)
    
    db.commit()

    return db_feedback

@router.patch("/{feedback_id}", response_model=FeedbackSchema)
def patch_feedback(feedback_id: int, feedback_update: FeedbackUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    feedback = db.query(FeedbackModel).filter(FeedbackModel.id == feedback_id).first()
    if feedback is None:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    # Allow admin and personnel to update any feedback, students only their own
    if current_user.role not in [UserRole.ADMIN, UserRole.PERSONNEL]:
        if feedback.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
    
    for key, value in feedback_update.dict(exclude_unset=True).items():
        setattr(feedback, key, value)
    db.commit()
    db.refresh(feedback)
    
    # Audit log
    audit = AuditLog(user_id=current_user.id, action="update_feedback", details=f"Updated feedback {feedback_id}")
    db.add(audit)
    db.commit()
    return feedback

@router.put("/{feedback_id}", response_model=FeedbackSchema)
def update_feedback(feedback_id: int, feedback_update: FeedbackUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    feedback = db.query(FeedbackModel).filter(FeedbackModel.id == feedback_id).first()
    if feedback is None:
        raise HTTPException(status_code=404, detail="Feedback not found")
    if feedback.user_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    for key, value in feedback_update.dict(exclude_unset=True).items():
        setattr(feedback, key, value)
    db.commit()
    db.refresh(feedback)
    # Audit log
    audit = AuditLog(user_id=current_user.id, action="update_feedback", details=f"Updated feedback {feedback_id}")
    db.add(audit)
    db.commit()
    return feedback

@router.delete("/{feedback_id}")
def delete_feedback(feedback_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    feedback = db.query(FeedbackModel).filter(FeedbackModel.id == feedback_id).first()
    if feedback is None:
        raise HTTPException(status_code=404, detail="Feedback not found")
    if feedback.user_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    db.delete(feedback)
    db.commit()
    # Audit log
    audit = AuditLog(user_id=current_user.id, action="delete_feedback", details=f"Deleted feedback {feedback_id}")
    db.add(audit)
    db.commit()
    return {"message": "Feedback deleted"}

@router.post("/{feedback_id}/upload", response_model=AttachmentSchema)
def upload_attachment(feedback_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    feedback = db.query(FeedbackModel).filter(FeedbackModel.id == feedback_id).first()
    if feedback is None:
        raise HTTPException(status_code=404, detail="Feedback not found")
    if feedback.user_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Validate file
    validate_file_upload(file)

    # Generate secure filename
    secure_filename = get_secure_filename(file.filename)
    file_path = os.path.join(settings.upload_directory, secure_filename)

    # Ensure upload directory exists
    os.makedirs(settings.upload_directory, exist_ok=True)

    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    db_attachment = Attachment(feedback_id=feedback_id, filename=file.filename, filepath=file_path)
    db.add(db_attachment)
    db.commit()
    db.refresh(db_attachment)

    # Audit log
    log_action(db, current_user.id, "upload_attachment", f"Uploaded file {file.filename} to feedback {feedback_id}")

    return db_attachment

@router.get("/{feedback_id}/responses", response_model=List[ResponseSchema])
def get_feedback_responses(feedback_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    """Get all responses for a feedback"""
    feedback = db.query(FeedbackModel).filter(FeedbackModel.id == feedback_id).first()
    if feedback is None:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    responses = db.query(ResponseModel).filter(ResponseModel.feedback_id == feedback_id).order_by(ResponseModel.created_at.asc()).all()
    
    # Eager load user data for each response
    for response in responses:
        response.user  # This triggers the lazy loading
    
    return responses

@router.post("/{feedback_id}/responses", response_model=ResponseSchema)
def create_response(feedback_id: int, response: ResponseCreate, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    """Add a response to a feedback (admin/personnel only)"""
    if current_user.role not in [UserRole.ADMIN, UserRole.PERSONNEL]:
        raise HTTPException(status_code=403, detail="Only admin and personnel can respond to feedbacks")
    
    feedback = db.query(FeedbackModel).filter(FeedbackModel.id == feedback_id).first()
    if feedback is None:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    # Create response
    db_response = ResponseModel(
        feedback_id=feedback_id,
        user_id=current_user.id,
        content=response.content
    )
    db.add(db_response)
    db.commit()
    db.refresh(db_response)
    
    # Notify feedback creator
    notification = Notification(
        user_id=feedback.user_id,
        title="Nouvelle réponse à votre feedback",
        message=f"{current_user.prenom} {current_user.nom} a répondu à votre feedback: {feedback.title}"
    )
    db.add(notification)
    db.commit()
    
    # Send realtime notification
    try:
        send_notification_to_user(feedback.user_id, {
            "type": "response",
            "title": "Nouvelle réponse",
            "message": f"Réponse ajoutée à votre feedback: {feedback.title}"
        })
    except:
        pass
    
    # Audit log
    log_action(db, current_user.id, "create_response", f"Added response to feedback {feedback_id}")
    
    return db_response