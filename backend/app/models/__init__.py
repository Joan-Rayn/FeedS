from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from ..core.database import Base

class UserRole(str, enum.Enum):
    ETUDIANT = "etudiant"
    PERSONNEL = "personnel"
    ADMIN = "admin"

class FeedbackStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"

class Priority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    matricule = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    nom = Column(String, nullable=False)
    prenom = Column(String, nullable=False)
    date_naissance = Column(DateTime, nullable=False)
    # Store the enum's string values (e.g. 'etudiant') in the DB instead of the
    # Python enum member names (e.g. 'ETUDIANT'). Using SQLAlchemy's Enum with
    # a values_callable ensures the column stores the enum values.
    role = Column(SAEnum(UserRole, values_callable=lambda obj: [e.value for e in obj]), default=UserRole.ETUDIANT, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    feedbacks = relationship("Feedback", back_populates="user")
    responses = relationship("Response", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    activity_logs = relationship("ActivityLog", back_populates="user")

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text)

    feedbacks = relationship("Feedback", back_populates="category")

class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    status = Column(SAEnum(FeedbackStatus, values_callable=lambda obj: [e.value for e in obj]), default=FeedbackStatus.OPEN)
    priority = Column(SAEnum(Priority, values_callable=lambda obj: [e.value for e in obj]), default=Priority.MEDIUM)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    category = relationship("Category", back_populates="feedbacks")
    user = relationship("User", back_populates="feedbacks")
    responses = relationship("Response", back_populates="feedback")
    attachments = relationship("Attachment", back_populates="feedback")

class Response(Base):
    __tablename__ = "responses"

    id = Column(Integer, primary_key=True, index=True)
    feedback_id = Column(Integer, ForeignKey("feedbacks.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    feedback = relationship("Feedback", back_populates="responses")
    user = relationship("User", back_populates="responses")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="notifications")

class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(Integer, primary_key=True, index=True)
    feedback_id = Column(Integer, ForeignKey("feedbacks.id"))
    filename = Column(String, nullable=False)
    filepath = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    feedback = relationship("Feedback", back_populates="attachments")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String, nullable=False)
    details = Column(Text)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")

from .activity_log import ActivityLog