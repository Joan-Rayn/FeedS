from sqlalchemy import create_engine, text
from app.core.config import settings

engine = create_engine(settings.database_url)
conn = engine.connect()

print("\n🔍 Comptes existants:\n")
result = conn.execute(text("SELECT matricule, email, role FROM users WHERE role = 'ADMIN' OR matricule LIKE 'ADM%' OR matricule LIKE 'PER%' OR matricule LIKE 'ETU%' LIMIT 10"))
for row in result:
    print(f"  ✓ {row[0]:8} | {row[1]:25} | {row[2]}")

print("\n📊 Total utilisateurs:")
result = conn.execute(text("SELECT role, COUNT(*) FROM users GROUP BY role"))
for row in result:
    print(f"  {row[0]:15}: {row[1]} utilisateurs")

conn.close()
print("\n✅ Les mots de passe par défaut sont:\n  - admin123\n  - personnel123\n  - etudiant123\n")
