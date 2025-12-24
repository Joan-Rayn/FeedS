"""
Create specific test accounts: ADMIN001, PER001, ETU001
"""
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models import User
from passlib.context import CryptContext
import datetime

pwd_context = CryptContext(schemes=["bcrypt", "pbkdf2_sha256"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_test_accounts():
    db = SessionLocal()
    try:
        test_accounts = [
            {
                "matricule": "ADMIN001",
                "nom": "Admin",
                "prenom": "System",
                "email": "admin@enspd.sn",
                "password": "admin123",
                "role": "admin",
                "date_naissance": datetime.date(1980, 1, 1)
            },
            {
                "matricule": "PER001",
                "nom": "Personnel",
                "prenom": "Test",
                "email": "personnel@enspd.sn",
                "password": "personnel123",
                "role": "personnel",
                "date_naissance": datetime.date(1975, 5, 15)
            },
            {
                "matricule": "ETU001",
                "nom": "Etudiant",
                "prenom": "Test",
                "email": "etudiant@enspd.sn",
                "password": "etudiant123",
                "role": "etudiant",
                "date_naissance": datetime.date(2000, 8, 20)
            }
        ]

        print("\n" + "="*60)
        print("🔧 CRÉATION DES COMPTES DE TEST")
        print("="*60 + "\n")

        for account in test_accounts:
            existing = db.query(User).filter(User.matricule == account["matricule"]).first()
            if existing:
                print(f"⚠️  {account['matricule']} existe déjà, mise à jour...")
                existing.password_hash = get_password_hash(account["password"])
                existing.email = account["email"]
                existing.nom = account["nom"]
                existing.prenom = account["prenom"]
                existing.role = account["role"]
            else:
                print(f"✅ Création de {account['matricule']}...")
                user = User(
                    matricule=account["matricule"],
                    nom=account["nom"],
                    prenom=account["prenom"],
                    date_naissance=account["date_naissance"],
                    email=account["email"],
                    password_hash=get_password_hash(account["password"]),
                    role=account["role"]
                )
                db.add(user)
        
        db.commit()
        
        print("\n" + "="*60)
        print("✅ Comptes de test créés avec succès!")
        print("="*60)
        print("\n📋 Identifiants:")
        print(f"  Admin:     ADMIN001 / admin123")
        print(f"  Personnel: PER001 / personnel123")
        print(f"  Étudiant:  ETU001 / etudiant123")
        print("\n💡 Utilisez ces identifiants pour vous connecter sur http://localhost:5176/login")
        print("\n")
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_test_accounts()
