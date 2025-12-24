from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from ..core.database import Base

class ActivityType(str, enum.Enum):
    LOGIN = "login"
    LOGOUT = "logout"
    FEEDBACK_CREATED = "feedback_created"
    FEEDBACK_UPDATED = "feedback_updated"
    FEEDBACK_ASSIGNED = "feedback_assigned"
    FEEDBACK_RESOLVED = "feedback_resolved"
    USER_CREATED = "user_created"
    USER_UPDATED = "user_updated"
    USER_DELETED = "user_deleted"
    PASSWORD_CHANGED = "password_changed"
    PROFILE_UPDATED = "profile_updated"
    CATEGORY_CREATED = "category_created"
    CATEGORY_UPDATED = "category_updated"
    CATEGORY_DELETED = "category_deleted"
    NOTIFICATION_SENT = "notification_sent"
    FILE_UPLOADED = "file_uploaded"
    SEARCH_PERFORMED = "search_performed"
    ADMIN_ACTION = "admin_action"

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    activity_type = Column(Enum(ActivityType), nullable=False)
    description = Column(Text, nullable=False)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    extra_data = Column(Text, nullable=True)  # JSON string for additional data
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="activity_logs")