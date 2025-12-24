"""
Create admin account automatically on server startup
"""
from sqlalchemy.orm import Session
from .core.database import SessionLocal
from .models import User
from passlib.context import CryptContext
import datetime

pwd_context = CryptContext(schemes=["bcrypt", "pbkdf2_sha256"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_admin_account():
    """Create admin account if it doesn't exist"""
    db = SessionLocal()
    try:
        # Admin account details
        admin_data = {
            "matricule": "ADMIN001",
            "nom": "Admin",
            "prenom": "System",
            "email": "admin@enspd.sn",
            "password": "admin123",
            "role": "admin",
            "date_naissance": datetime.date(1980, 1, 1)
        }

        # Check if admin already exists
        existing_admin = db.query(User).filter(
            (User.matricule == admin_data["matricule"]) |
            (User.email == admin_data["email"])
        ).first()

        if existing_admin:
            print("ℹ️  Le compte admin existe déjà.")
            return

        # Create admin account
        admin = User(
            matricule=admin_data["matricule"],
            nom=admin_data["nom"],
            prenom=admin_data["prenom"],
            date_naissance=admin_data["date_naissance"],
            email=admin_data["email"],
            password_hash=get_password_hash(admin_data["password"]),
            role=admin_data["role"]
        )

        db.add(admin)
        db.commit()

        print("✅ Compte admin créé avec succès.")
        print(f"   Matricule: {admin_data['matricule']}")
        print(f"   Email: {admin_data['email']}")
        print(f"   Mot de passe: {admin_data['password']}")

    except Exception as e:
        print(f"❌ Erreur lors de la création du compte admin: {e}")
        db.rollback()
    finally:
        db.close()