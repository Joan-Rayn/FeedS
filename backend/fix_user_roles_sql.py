#!/usr/bin/env python3
"""
Script pour corriger les rôles d'utilisateurs dans la base de données.
Utilise une requête SQL directe pour éviter la validation de l'enum.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import get_db
from sqlalchemy import text

def fix_user_roles_sql():
    """Corrige les rôles d'utilisateurs en utilisant SQL direct."""
    db = next(get_db())

    try:
        # Utiliser SQL direct pour éviter la validation de l'enum
        # Mettre à jour les rôles incorrects
        result1 = db.execute(text("UPDATE users SET role = 'etudiant' WHERE role = 'ETUDIANT'"))
        result2 = db.execute(text("UPDATE users SET role = 'personnel' WHERE role = 'PERSONNEL'"))
        result3 = db.execute(text("UPDATE users SET role = 'admin' WHERE role = 'ADMIN'"))

        # Compter les modifications
        total_updated = result1.rowcount + result2.rowcount + result3.rowcount

        print(f"✅ {total_updated} rôles d'utilisateurs corrigés avec succès !")
        print(f"  - ETUDIANT -> etudiant: {result1.rowcount}")
        print(f"  - PERSONNEL -> personnel: {result2.rowcount}")
        print(f"  - ADMIN -> admin: {result3.rowcount}")

        # Commit les changements
        db.commit()

    except Exception as e:
        db.rollback()
        print(f"❌ Erreur lors de la correction des rôles: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    fix_user_roles_sql()