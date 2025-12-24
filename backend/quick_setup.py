"""
Script simplifié pour créer la base de données et ajouter les comptes de test essentiels.
Utiliser: python backend/quick_setup.py
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models import User, Category, Feedback, Response
from passlib.context import CryptContext
import datetime

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

print("🔨 Création des tables...")
Base.metadata.create_all(bind=engine)
print("✅ Tables créées!\n")

db = SessionLocal()

try:
    # Catégories
    print("📁 Création des catégories...")
    categories = [
        Category(name="Cours", description="Problèmes liés aux cours"),
        Category(name="Administration", description="Services administratifs"),
        Category(name="Infrastructures", description="Bâtiments et équipements"),
        Category(name="Services", description="Services étudiants"),
        Category(name="Autre", description="Autres problèmes"),
    ]
    
    for cat in categories:
        if not db.query(Category).filter(Category.name == cat.name).first():
            db.add(cat)
    db.commit()
    print("✅ Catégories créées!\n")

    # Comptes de test
    print("👥 Création des comptes de test...")
    
    test_users = [
        {
            "matricule": "ADM001",
            "nom": "Admin",
            "prenom": "Principal",
            "date_naissance": datetime.date(1985, 1, 15),
            "email": "admin@enspd.sn",
            "password": "admin123",
            "role": "admin"
        },
        {
            "matricule": "PER001",
            "nom": "Personnel",
            "prenom": "Test",
            "date_naissance": datetime.date(1988, 5, 20),
            "email": "personnel@enspd.sn",
            "password": "personnel123",
            "role": "personnel"
        },
        {
            "matricule": "ETU001",
            "nom": "Etudiant",
            "prenom": "Test",
            "date_naissance": datetime.date(2001, 9, 10),
            "email": "etudiant@enspd.sn",
            "password": "etudiant123",
            "role": "etudiant"
        },
    ]

    for user_data in test_users:
        if not db.query(User).filter(User.matricule == user_data["matricule"]).first():
            password = user_data.pop("password")
            user = User(**user_data, password_hash=get_password_hash(password))
            db.add(user)
    
    db.commit()
    print("✅ Comptes de test créés!\n")

    # Quelques feedbacks de test
    print("💬 Création de feedbacks de test...")
    etudiant = db.query(User).filter(User.matricule == "ETU001").first()
    admin = db.query(User).filter(User.matricule == "ADM001").first()
    cat_cours = db.query(Category).filter(Category.name == "Cours").first()
    cat_infra = db.query(Category).filter(Category.name == "Infrastructures").first()

    if etudiant and cat_cours and cat_infra:
        feedbacks_test = [
            Feedback(
                title="WiFi instable dans la salle A101",
                description="Le réseau WiFi se déconnecte régulièrement, ce qui perturbe les cours en ligne.",
                category_id=cat_infra.id,
                user_id=etudiant.id,
                status="open",
                priority="high"
            ),
            Feedback(
                title="Cours de Mathématiques trop rapide",
                description="Le rythme du cours est difficile à suivre pour la majorité des étudiants.",
                category_id=cat_cours.id,
                user_id=etudiant.id,
                status="in_progress",
                priority="medium"
            ),
            Feedback(
                title="Climatisation en panne",
                description="La climatisation de l'amphithéâtre ne fonctionne plus depuis 3 jours.",
                category_id=cat_infra.id,
                user_id=etudiant.id,
                status="resolved",
                priority="high"
            ),
        ]

        for fb in feedbacks_test:
            db.add(fb)
        
        db.commit()

        # Ajouter une réponse au feedback "in_progress"
        fb_in_progress = db.query(Feedback).filter(
            Feedback.status == "in_progress"
        ).first()
        
        if fb_in_progress and admin:
            response = Response(
                feedback_id=fb_in_progress.id,
                user_id=admin.id,
                content="Merci pour votre retour. Nous avons transmis votre remarque au professeur concerné."
            )
            db.add(response)
            db.commit()

        print("✅ Feedbacks de test créés!\n")

    print("=" * 60)
    print("✅ CONFIGURATION TERMINÉE AVEC SUCCÈS!")
    print("=" * 60)
    print("\n🔐 COMPTES DE TEST:")
    print("   • Admin:      ADM001 / admin123")
    print("   • Personnel:  PER001 / personnel123")
    print("   • Étudiant:   ETU001 / etudiant123")
    print("\n💡 PROCHAINES ÉTAPES:")
    print("   1. Backend:  cd backend && uvicorn app.main:app --reload")
    print("   2. Frontend: cd frontend && npm run dev")
    print("   3. Accédez à http://localhost:5176")
    print("\n" + "=" * 60 + "\n")

except Exception as e:
    print(f"\n❌ ERREUR: {e}")
    import traceback
    traceback.print_exc()
    db.rollback()
finally:
    db.close()
