from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime
from ..models import UserRole, FeedbackStatus, Priority

class UserBase(BaseModel):
    matricule: str
    email: EmailStr
    nom: str
    prenom: str
    date_naissance: datetime
    role: UserRole = UserRole.ETUDIANT

    @field_validator('date_naissance', mode='before')
    @classmethod
    def parse_date_naissance(cls, v):
        if isinstance(v, str):
            # Parse date string to datetime
            try:
                # Try ISO format first
                return datetime.fromisoformat(v.replace('Z', '+00:00'))
            except ValueError:
                try:
                    # Try date only format
                    return datetime.fromisoformat(v + 'T00:00:00')
                except ValueError:
                    # Fallback: assume YYYY-MM-DD format
                    return datetime.strptime(v, '%Y-%m-%d')
        return v

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    matricule: Optional[str] = None
    email: Optional[EmailStr] = None
    nom: Optional[str] = None
    prenom: Optional[str] = None
    date_naissance: Optional[datetime] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

    @field_validator('date_naissance', mode='before')
    @classmethod
    def parse_date_naissance(cls, v):
        if isinstance(v, str) and v:
            # Parse date string to datetime
            try:
                # Try ISO format first
                return datetime.fromisoformat(v.replace('Z', '+00:00'))
            except ValueError:
                try:
                    # Try date only format
                    return datetime.fromisoformat(v + 'T00:00:00')
                except ValueError:
                    # Fallback: assume YYYY-MM-DD format
                    return datetime.strptime(v, '%Y-%m-%d')
        return v

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int

    class Config:
        from_attributes = True

class FeedbackBase(BaseModel):
    title: str
    description: str
    priority: Priority = Priority.MEDIUM

class FeedbackCreate(FeedbackBase):
    pass

class FeedbackUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[FeedbackStatus] = None
    priority: Optional[Priority] = None

class FeedbackUser(BaseModel):
    """Nested user schema for Feedback"""
    id: int
    prenom: str
    nom: str
    email: str
    role: UserRole
    
    class Config:
        from_attributes = True

class AttachmentBase(BaseModel):
    filename: str
    filepath: str

class Attachment(AttachmentBase):
    id: int
    feedback_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class Feedback(FeedbackBase):
    id: int
    user_id: int
    user: Optional[FeedbackUser] = None
    status: FeedbackStatus
    attachments: Optional[List[Attachment]] = []
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class ResponseBase(BaseModel):
    content: str

class ResponseCreate(ResponseBase):
    pass

class ResponseUser(BaseModel):
    """Nested user schema for Response"""
    id: int
    prenom: str
    nom: str
    role: UserRole
    
    class Config:
        from_attributes = True

class Response(ResponseBase):
    id: int
    feedback_id: int
    user_id: int
    user: Optional[ResponseUser] = None
    created_at: datetime

    class Config:
        from_attributes = True

class NotificationBase(BaseModel):
    title: str
    message: str

class Notification(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class AttachmentBase(BaseModel):
    filename: str

class Attachment(AttachmentBase):
    id: int
    feedback_id: int
    filepath: str
    created_at: datetime

    class Config:
        from_attributes = True

class AuditLog(BaseModel):
    id: int
    user_id: int
    action: str
    details: Optional[str]
    timestamp: datetime

    class Config:
        from_attributes = True

class ActivityLogResponse(BaseModel):
    id: int
    user_id: int
    activity_type: str
    description: str
    ip_address: Optional[str]
    user_agent: Optional[str]
    extra_data: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True