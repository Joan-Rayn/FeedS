#!/usr/bin/env python3
"""
Script pour corriger les rôles d'utilisateurs dans la base de données.
Les rôles doivent être en minuscules selon l'enum UserRole.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import get_db
from app.models import User

def fix_user_roles():
    """Corrige les rôles d'utilisateurs incorrects dans la base de données."""
    db = next(get_db())

    try:
        # Trouver tous les utilisateurs avec des rôles incorrects
        users_to_fix = db.query(User).filter(User.role.in_(['ETUDIANT', 'PERSONNEL', 'ADMIN'])).all()

        print(f"Trouvé {len(users_to_fix)} utilisateurs avec des rôles à corriger")

        for user in users_to_fix:
            old_role = user.role
            if old_role == 'ETUDIANT':
                user.role = 'etudiant'
            elif old_role == 'PERSONNEL':
                user.role = 'personnel'
            elif old_role == 'ADMIN':
                user.role = 'admin'

            print(f"Corrigé {user.matricule}: {old_role} -> {user.role}")

        # Commit les changements
        db.commit()
        print("✅ Tous les rôles ont été corrigés avec succès !")

    except Exception as e:
        db.rollback()
        print(f"❌ Erreur lors de la correction des rôles: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    fix_user_roles()