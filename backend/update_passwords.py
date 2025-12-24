from app.core.database import SessionLocal
from app.models import User
from app.utils.auth import get_password_hash

# Passwords mapping
passwords = {
    "ADMIN001": "admin123",
    "AD0025": "password123",
    "ST0034": "password123",
    "ET0047": "password123",
    "EN0056": "password123",
    "GE0067": "password123",
    "MA0078": "password123",
    "PH0089": "password123",
    "CH0090": "password123",
    "BI0101": "password123",
    "MI0112": "password123",
    "PE0012": "password123",
    "PE0023": "password123",
    "PE0034": "password123",
    "PE0045": "password123",
}

db = SessionLocal()
try:
    for matricule, password in passwords.items():
        user = db.query(User).filter(User.matricule == matricule).first()
        if user:
            user.password_hash = get_password_hash(password)
            print(f"Updated {matricule}")
    db.commit()
    print("All passwords updated")
except Exception as e:
    print(f"Error: {e}")
    db.rollback()
finally:
    db.close()