from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models import User, Category, Feedback, Response, Notification
from passlib.context import CryptContext
import datetime
import random

pwd_context = CryptContext(schemes=["bcrypt", "pbkdf2_sha256"], deprecated="auto")

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
                date_naissance=datetime.date.fromisoformat("1980-01-01"),
                email="admin@enspd.sn",
                password_hash=get_password_hash("admin123"),
                role="admin"
            )
            db.add(admin)
            db.commit()

        # Generate 500 students
        first_names = ["Alice", "Bob", "Claire", "David", "Emma", "Felix", "Gabrielle", "Hugo", "Ines", "Jules", "Karine", "Louis", "Marie", "Nicolas", "Olivia", "Pierre", "Quentin", "Rose", "Sylvain", "Théo", "Ursule", "Victor", "Wendy", "Xavier", "Yasmine", "Zacharie"]
        last_names = ["Dupont", "Martin", "Dubois", "Lopez", "Garcia", "Roux", "Moreau", "Fournier", "Girard", "Andre", "Bonnet", "Francois", "Thomas", "Robert", "Richard", "Petit", "Durand", "Leroy", "Morel", "Simon", "Laurent", "Michel", "Lefebvre", "Bertrand", "Rousseau", "Vincent"]

        students_created = 0
        for i in range(500):
            matricule = f"ET{i+1:04d}"
            existing = db.query(User).filter(User.matricule == matricule).first()
            if not existing:
                nom = random.choice(last_names)
                prenom = random.choice(first_names)
                birth_year = random.randint(1998, 2003)
                birth_month = random.randint(1, 12)
                birth_day = random.randint(1, 28)
                date_naissance = datetime.date(birth_year, birth_month, birth_day)
                email = f"{prenom.lower()}.{nom.lower()}.{i+1}@enspd.sn"  # Make unique
                
                user = User(
                    matricule=matricule,
                    nom=nom,
                    prenom=prenom,
                    date_naissance=date_naissance,
                    email=email,
                    password_hash=get_password_hash("password123"),
                    role="etudiant"
                )
                db.add(user)
                students_created += 1
                
                if students_created % 100 == 0:
                    db.commit()
                    print(f"Créé {students_created} étudiants...")

        db.commit()

        # Generate 50 personnel
        personnel_titles = ["Prof", "Dr", "Mme", "M"]
        personnel_roles = ["personnel"] * 45 + ["admin"] * 5  # 5 admins supplémentaires
        
        personnel_created = 0
        for i in range(50):
            matricule = f"PE{i+1:04d}"
            existing = db.query(User).filter(User.matricule == matricule).first()
            if not existing:
                nom = random.choice(last_names)
                prenom = random.choice(first_names)
                birth_year = random.randint(1970, 1985)
                birth_month = random.randint(1, 12)
                birth_day = random.randint(1, 28)
                date_naissance = datetime.date(birth_year, birth_month, birth_day)
                email = f"{prenom.lower()}.{nom.lower()}.{i+1}@enspd.sn"  # Make unique
                role = personnel_roles[i] if i < len(personnel_roles) else "personnel"
                
                user = User(
                    matricule=matricule,
                    nom=nom,
                    prenom=prenom,
                    date_naissance=date_naissance,
                    email=email,
                    password_hash=get_password_hash("password123"),
                    role=role
                )
                db.add(user)
                personnel_created += 1

        db.commit()
        print(f"Créé {personnel_created} personnels...")

        # Get all categories and students
        categories_db = db.query(Category).all()
        students = db.query(User).filter(User.role == "etudiant").all()
        
        # Generate 1000 feedbacks
        feedback_titles = [
            "Problème avec le WiFi", "Cours trop rapide", "Salle fermée", "Inscription bloquée",
            "Climatisation défaillante", "Ressources insuffisantes", "Imprimante en panne",
            "Cours trop théorique", "Prix élevés à la cantine", "Transports insuffisants",
            "Salle bruyante", "Explication confuse", "Accès handicapés limité",
            "Notation injuste", "Activités sportives manquantes", "Bibliothèque fermée tôt",
            "Ordinateurs lents", "Projet non clair", "Examens difficiles", "Groupe trop grand",
            "Matériel manquant", "Professeur absent", "Devoirs trop nombreux",
            "Planning changeant", "Salle sale", "Éclairage insuffisant", "Chaises cassées",
            "Tableaux effacés", "Microphones défaillants", "Projections floues"
        ]
        
        feedback_descriptions = [
            "Le problème persiste depuis plusieurs jours", "Difficile de suivre le rythme",
            "Impacte négativement les études", "Urgent de résoudre", "Besoin d'amélioration rapide",
            "Les étudiants sont frustrés", "Qualité dégradée", "Manque de confort",
            "Conditions d'étude inadéquates", "Nécessite une intervention immédiate"
        ]
        
        statuses = ["open", "in_progress", "resolved", "closed"]
        status_weights = [0.4, 0.3, 0.2, 0.1]  # More open and in_progress
        
        feedbacks_created = 0
        for i in range(1000):
            title = f"{random.choice(feedback_titles)} - {i+1}"
            existing = db.query(Feedback).filter(Feedback.title == title).first()
            if not existing:
                description = f"{random.choice(feedback_descriptions)}. {random.choice(feedback_descriptions)}"
                category = random.choice(categories_db)
                student = random.choice(students)
                status = random.choices(statuses, weights=status_weights)[0]
                
                feedback = Feedback(
                    title=title,
                    description=description,
                    category_id=category.id,
                    user_id=student.id,
                    status=status
                )
                db.add(feedback)
                feedbacks_created += 1
                
                if feedbacks_created % 200 == 0:
                    db.commit()
                    print(f"Créé {feedbacks_created} feedbacks...")

        db.commit()
        print(f"Créé {feedbacks_created} feedbacks...")

        # Add some responses to in_progress feedbacks
        personnel = db.query(User).filter(User.role.in_(["personnel", "admin"])).all()
        in_progress_feedbacks = db.query(Feedback).filter(Feedback.status == "in_progress").all()
        
        responses_created = 0
        for fb in in_progress_feedbacks[:200]:  # Add responses to 200 feedbacks
            responder = random.choice(personnel)
            response_content = "Nous avons pris connaissance de votre retour. Une équipe compétente va analyser la situation et vous tenir informé des avancées."
            
            response = Response(
                feedback_id=fb.id,
                user_id=responder.id,
                content=response_content
            )
            db.add(response)
            responses_created += 1

        db.commit()
        print(f"Créé {responses_created} réponses...")

        print("Base de données remplie avec succès !")
        print(f"Total utilisateurs créés: {students_created + personnel_created + 1}")  # +1 for admin
        print(f"Total feedbacks créés: {feedbacks_created}")
        print(f"Total réponses créées: {responses_created}")
        print("Comptes de test :")
        print("- Admin: ADMIN001 / admin123")
        print("- Étudiant: ET0001 / password123")
        print("- Personnel: PE0001 / password123")

    except Exception as e:
        print(f"Erreur lors du remplissage: {e}")
        db.rollback()
    finally:
        db.close()

populate_database()