from app.core.database import SessionLocal, engine, Base
from app.models import User
from sqlalchemy import text
import datetime


def main():
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    session = SessionLocal()
    try:
        print("[debug_role] Cleaning any existing TEST_DEBUG user...")
        session.execute(text("DELETE FROM users WHERE matricule = 'TEST_DEBUG'"))
        session.commit()

        print("[debug_role] Creating TEST_DEBUG with role='etudiant' (string)...")
        u = User(
            matricule='TEST_DEBUG',
            nom='Test',
            prenom='Debug',
            date_naissance=datetime.datetime(2000, 1, 1),
            email='test_debug@example.com',
            password_hash='hash',
            role='etudiant'
        )
        session.add(u)
        session.commit()

        print("[debug_role] Fetching via ORM...")
        db_user = session.query(User).filter(User.matricule == 'TEST_DEBUG').first()
        print('ORM role repr:', repr(db_user.role))
        print('ORM role type:', type(db_user.role))
        try:
            print('ORM role value:', db_user.role.value)
        except Exception as e:
            print('ORM role has no .value:', e)

        print("[debug_role] Fetching raw DB value...")
        row = session.execute(text("SELECT role FROM users WHERE matricule = 'TEST_DEBUG'"))
        fetched = row.fetchone()
        print('Raw DB role:', fetched[0] if fetched else None)

    except Exception as exc:
        print('[debug_role] Exception:', exc)
        session.rollback()
    finally:
        session.close()


if __name__ == '__main__':
    main()
