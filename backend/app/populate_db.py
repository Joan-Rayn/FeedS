from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models import User, Category, Feedback, Response, Notification
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# Create tables
Base.metadata.create_all(bind=engine)

def populate_database():
    db = SessionLocal()
    try:
        # Create categories
        categories = [
            Category(name="Cours", description="Problèmes liés aux cours"),
            Category(name="Administration", description="Services administratifs"),
            Category(name="Infrastructures", description="Bâtiments et équipements"),
            Category(name="Services", description="Services étudiants"),
            Category(name="Autre", description="Autres problèmes"),
        ]

        for cat in categories:
            existing = db.query(Category).filter(Category.name == cat.name).first()
            if not existing:
                db.add(cat)

        db.commit()

        # Create admin user
        admin = db.query(User).filter(User.matricule == "ADMIN001").first()
        if not admin:
            admin = User(
                matricule="ADMIN001",
                nom="Admin",
                prenom="System",
                date_naissance="1980-01-01",
                email="admin@enspd.sn",
                hashed_password=get_password_hash("admin123"),
                role="admin"
            )
            db.add(admin)
            db.commit()

        # Create sample students (more)
        students_data = [
            ("AD0025", "Dupont", "Alice", "2000-05-15", "alice.dupont@enspd.sn", "etudiant"),
            ("ST0034", "Martin", "Bob", "1999-08-22", "bob.martin@enspd.sn", "etudiant"),
            ("ET0047", "Dubois", "Claire", "2001-03-10", "claire.dubois@enspd.sn", "etudiant"),
            ("EN0056", "Lopez", "David", "2000-11-05", "david.lopez@enspd.sn", "etudiant"),
            ("GE0067", "Garcia", "Emma", "1999-07-18", "emma.garcia@enspd.sn", "etudiant"),
            ("MA0078", "Roux", "Felix", "2001-09-30", "felix.roux@enspd.sn", "etudiant"),
            ("PH0089", "Moreau", "Gabrielle", "2000-12-12", "gabrielle.moreau@enspd.sn", "etudiant"),
            ("CH0090", "Fournier", "Hugo", "1999-04-25", "hugo.fournier@enspd.sn", "etudiant"),
            ("BI0101", "Girard", "Ines", "2001-01-08", "ines.girard@enspd.sn", "etudiant"),
            ("MI0112", "Andre", "Jules", "2000-06-20", "jules.andre@enspd.sn", "etudiant"),
        ]

        for matricule, nom, prenom, naissance, email, role in students_data:
            user = db.query(User).filter(User.matricule == matricule).first()
            if not user:
                user = User(
                    matricule=matricule,
                    nom=nom,
                    prenom=prenom,
                    date_naissance=naissance,
                    email=email,
                    hashed_password=get_password_hash("password123"),
                    role=role
                )
                db.add(user)

        # Create personnel (more)
        personnel_data = [
            ("PE0012", "Personnel", "Test", "1985-12-05", "personnel@enspd.sn", "personnel"),
            ("PE0023", "Admin", "Second", "1980-03-15", "admin2@enspd.sn", "personnel"),
        ]

        db.commit()

        # Create sample feedbacks
        categories_db = db.query(Category).all()
        students = db.query(User).filter(User.role == "etudiant").all()

        feedbacks_data = [
            ("Problème avec le WiFi en salle 101", "Le WiFi ne fonctionne pas depuis 3 jours", categories_db[2].id, students[0].id),
            ("Cours de Mathématiques trop rapide", "Le professeur va trop vite, difficile de suivre", categories_db[0].id, students[1].id),
            ("Bibliothèque fermée le weekend", "Impossible d'étudier le weekend", categories_db[3].id, students[2].id),
            ("Inscription administrative bloquée", "Erreur dans le système d'inscription", categories_db[1].id, students[0].id),
        ]

        for title, desc, cat_id, user_id in feedbacks_data:
            feedback = db.query(Feedback).filter(Feedback.title == title).first()
            if not feedback:
                feedback = Feedback(
                    title=title,
                    description=desc,
                    category_id=cat_id,
                    user_id=user_id,
                    status="pending"
                )
                db.add(feedback)

        db.commit()

        # Assign some feedbacks to personnel
        pending_feedbacks = db.query(Feedback).filter(Feedback.status == "pending").limit(2).all()
        for fb in pending_feedbacks:
            fb.status = "assigned"
            fb.assigned_to = personnel.id

        db.commit()

        # Add responses
        assigned_feedbacks = db.query(Feedback).filter(Feedback.status == "assigned").all()
        for fb in assigned_feedbacks[:1]:  # Add response to first one
            response = Response(
                feedback_id=fb.id,
                user_id=personnel.id,
                content="Nous avons identifié le problème. Une équipe technique va intervenir dans les 24h."
            )
            db.add(response)

        db.commit()

        print("Base de données remplie avec succès !")
        print("Comptes de test :")
        print("- Admin: ADMIN001 / admin123")
        print("- Étudiant: AD0025 / password123")
        print("- Personnel: PE0012 / personnel123")

    except Exception as e:
        print(f"Erreur lors du remplissage: {e}")
        db.rollback()
    finally:
        db.close()

populate_database()