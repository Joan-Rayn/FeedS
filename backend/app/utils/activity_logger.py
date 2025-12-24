from sqlalchemy.orm import Session
from ..models import ActivityLog, ActivityType
from typing import Optional, Dict, Any
import json

class ActivityLogger:
    def __init__(self, db: Session):
        self.db = db

    def log_activity(
        self,
        user_id: int,
        activity_type: ActivityType,
        description: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """Log an activity"""
        activity_log = ActivityLog(
            user_id=user_id,
            activity_type=activity_type,
            description=description,
            ip_address=ip_address,
            user_agent=user_agent,
            metadata=json.dumps(metadata) if metadata else None
        )

        self.db.add(activity_log)
        self.db.commit()
        self.db.refresh(activity_log)

        return activity_log

    # Convenience methods for common activities
    def log_login(self, user_id: int, ip_address: Optional[str] = None, user_agent: Optional[str] = None):
        return self.log_activity(
            user_id=user_id,
            activity_type=ActivityType.LOGIN,
            description="Connexion à l'application",
            ip_address=ip_address,
            user_agent=user_agent
        )

    def log_logout(self, user_id: int, ip_address: Optional[str] = None):
        return self.log_activity(
            user_id=user_id,
            activity_type=ActivityType.LOGOUT,
            description="Déconnexion de l'application",
            ip_address=ip_address
        )

    def log_feedback_created(self, user_id: int, feedback_id: int, title: str):
        return self.log_activity(
            user_id=user_id,
            activity_type=ActivityType.FEEDBACK_CREATED,
            description=f"Création du feedback: {title}",
            metadata={"feedback_id": feedback_id}
        )

    def log_feedback_updated(self, user_id: int, feedback_id: int, changes: Dict[str, Any]):
        return self.log_activity(
            user_id=user_id,
            activity_type=ActivityType.FEEDBACK_UPDATED,
            description=f"Mise à jour du feedback #{feedback_id}",
            metadata={"feedback_id": feedback_id, "changes": changes}
        )

    def log_feedback_assigned(self, user_id: int, feedback_id: int, assigned_to: int):
        return self.log_activity(
            user_id=user_id,
            activity_type=ActivityType.FEEDBACK_ASSIGNED,
            description=f"Feedback #{feedback_id} assigné à l'utilisateur #{assigned_to}",
            metadata={"feedback_id": feedback_id, "assigned_to": assigned_to}
        )

    def log_feedback_resolved(self, user_id: int, feedback_id: int):
        return self.log_activity(
            user_id=user_id,
            activity_type=ActivityType.FEEDBACK_RESOLVED,
            description=f"Feedback #{feedback_id} marqué comme résolu",
            metadata={"feedback_id": feedback_id}
        )

    def log_user_created(self, user_id: int, new_user_id: int, new_user_name: str):
        return self.log_activity(
            user_id=user_id,
            activity_type=ActivityType.USER_CREATED,
            description=f"Création de l'utilisateur: {new_user_name}",
            metadata={"new_user_id": new_user_id}
        )

    def log_user_updated(self, user_id: int, updated_user_id: int, changes: Dict[str, Any]):
        return self.log_activity(
            user_id=user_id,
            activity_type=ActivityType.USER_UPDATED,
            description=f"Mise à jour de l'utilisateur #{updated_user_id}",
            metadata={"updated_user_id": updated_user_id, "changes": changes}
        )

    def log_user_deleted(self, user_id: int, deleted_user_id: int, deleted_user_name: str):
        return self.log_activity(
            user_id=user_id,
            activity_type=ActivityType.USER_DELETED,
            description=f"Suppression de l'utilisateur: {deleted_user_name}",
            metadata={"deleted_user_id": deleted_user_id}
        )

    def log_password_changed(self, user_id: int):
        return self.log_activity(
            user_id=user_id,
            activity_type=ActivityType.PASSWORD_CHANGED,
            description="Changement de mot de passe"
        )

    def log_profile_updated(self, user_id: int, changes: Dict[str, Any]):
        return self.log_activity(
            user_id=user_id,
            activity_type=ActivityType.PROFILE_UPDATED,
            description="Mise à jour du profil",
            metadata={"changes": changes}
        )

    def log_search_performed(self, user_id: int, query: str, results_count: int):
        return self.log_activity(
            user_id=user_id,
            activity_type=ActivityType.SEARCH_PERFORMED,
            description=f"Recherche effectuée: '{query}' ({results_count} résultats)",
            metadata={"query": query, "results_count": results_count}
        )

    def log_admin_action(self, user_id: int, action: str, details: str):
        return self.log_activity(
            user_id=user_id,
            activity_type=ActivityType.ADMIN_ACTION,
            description=f"Action administrateur: {action}",
            metadata={"action": action, "details": details}
        )