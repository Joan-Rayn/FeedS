# 📝 Commandes Essentielles - FeedS

## 🚀 Démarrage Rapide

### Vérification de l'Environnement
```bash
python check_env.py
```

### Backend (Terminal 1)
```bash
cd backend
pip install -r requirements.txt
python create_db.py
python populate_db.py
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```

---

## 🗄️ Base de Données

### Créer la Base de Données
```bash
cd backend
python create_db.py
```

### Peupler avec Données de Test
```bash
python populate_db.py
```

### Se Connecter à PostgreSQL
```bash
psql -U postgres -d feeds_db
```

### Requêtes SQL Utiles
```sql
-- Lister les utilisateurs
SELECT matricule, email, role FROM users;

-- Lister les feedbacks
SELECT id, title, status FROM feedbacks;

-- Compter par statut
SELECT status, COUNT(*) FROM feedbacks GROUP BY status;
```

---

## 🔧 Backend

### Démarrer en Mode Debug
```bash
cd backend
uvicorn app.main:app --reload --log-level debug
```

### Démarrer avec un Autre Port
```bash
uvicorn app.main:app --reload --port 8001
```

### Installer Nouvelle Dépendance
```bash
pip install nom-package
pip freeze > requirements.txt
```

### Accéder au Shell Python avec DB
```bash
cd backend
python
```
```python
from app.core.database import SessionLocal
from app.models import User, Feedback

db = SessionLocal()
users = db.query(User).all()
print(f"Total users: {len(users)}")
```

---

## 🎨 Frontend

### Démarrer en Mode Dev
```bash
cd frontend
npm run dev
```

### Build pour Production
```bash
npm run build
```

### Preview du Build
```bash
npm run preview
```

### Installer Nouvelle Dépendance
```bash
npm install nom-package
npm install --save-dev nom-package  # Dev dependency
```

### Lint du Code
```bash
npm run lint
```

---

## 📦 Gestion des Packages

### Backend - Mettre à Jour Tout
```bash
pip install --upgrade -r requirements.txt
```

### Frontend - Mettre à Jour Tout
```bash
npm update
```

### Frontend - Audit de Sécurité
```bash
npm audit
npm audit fix
```

---

## 🧪 Tests (Quand Implémentés)

### Backend
```bash
cd backend
pytest
pytest -v  # Verbose
pytest --cov  # Avec couverture
```

### Frontend
```bash
cd frontend
npm test
npm test -- --coverage
```

---

## 🐳 Docker (Si Utilisé)

### Build Backend
```bash
cd backend/app
docker build -t feeds-backend .
```

### Run Backend
```bash
docker run -p 8000:8000 feeds-backend
```

### Avec Docker Compose
```bash
docker-compose up
docker-compose up -d  # Detached
docker-compose down
```

---

## 🔍 Debugging

### Logs Backend
```bash
# Les logs apparaissent dans le terminal
# Ou dans backend/logs/ si configuré
tail -f backend/logs/app.log
```

### Vérifier Port Occupé
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti :8000 | xargs kill -9
```

### Test API avec cURL
```bash
# Test racine
curl http://localhost:8000

# Test health check
curl http://localhost:8000/api/v1/metrics/health

# Test login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=ADM001&password=admin123"
```

---

## 🌐 Variables d'Environnement

### Backend (.env dans backend/app/)
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/feeds_db
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

### Frontend (.env dans frontend/)
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_ENV=development
VITE_PWA_ENABLED=true
```

### Générer SECRET_KEY
```bash
openssl rand -hex 32
```

---

## 📊 Métriques & Monitoring

### Prometheus Metrics
```bash
curl http://localhost:8001/metrics
```

### Health Check
```bash
curl http://localhost:8000/api/v1/metrics/health
```

---

## 🔄 Git

### Commandes de Base
```bash
git status
git add .
git commit -m "Description des changements"
git push origin master
```

### Créer une Branche
```bash
git checkout -b feature/nom-feature
git push -u origin feature/nom-feature
```

### Mettre à Jour depuis Master
```bash
git checkout master
git pull origin master
git checkout feature/nom-feature
git merge master
```

---

## 🚀 Déploiement Render

### Deploy Backend
```bash
# Push vers GitHub puis Render auto-deploy
git push origin master
```

### Build Local Frontend
```bash
cd frontend
npm run build
# dist/ contient le build
```

### Variables Render Backend
```bash
DATABASE_URL=<from-render-postgres>
SECRET_KEY=<generate-with-openssl>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
UPLOAD_DIRECTORY=/tmp/uploads
MAX_UPLOAD_SIZE=10485760
```

### Variables Render Frontend
```bash
VITE_API_BASE_URL=https://your-backend.onrender.com
VITE_APP_ENV=production
VITE_PWA_ENABLED=true
```

---

## 🛠️ Maintenance

### Nettoyer Cache Backend
```bash
find . -type d -name __pycache__ -exec rm -rf {} +
find . -type f -name "*.pyc" -delete
```

### Nettoyer Cache Frontend
```bash
cd frontend
rm -rf node_modules
rm -rf dist
rm -rf .vite
npm install
```

### Reset Base de Données
```bash
cd backend
python create_db.py  # Recrée les tables
python populate_db.py  # Réinsère les données
```

---

## 🆘 Dépannage Rapide

### Backend ne démarre pas
```bash
# 1. Vérifier PostgreSQL est démarré
# 2. Vérifier DATABASE_URL correct
# 3. Réinstaller dépendances
pip install -r requirements.txt
```

### Frontend ne se connecte pas
```bash
# 1. Vérifier backend tourne sur :8000
# 2. Vérifier VITE_API_BASE_URL dans .env
# 3. Clear cache et rebuild
rm -rf node_modules dist .vite
npm install
npm run dev
```

### Erreur CORS
```bash
# Vérifier CORS_ORIGINS dans backend config
# Ajouter l'URL frontend si nécessaire
```

### Port déjà utilisé
```bash
# Changer le port ou tuer le processus
# Backend: --port 8001
# Frontend: utilise auto le prochain port libre
```

---

## 📚 Documentation

- **Démarrage**: QUICK_START.md
- **Déploiement**: DEPLOYMENT_GUIDE.md
- **Problèmes**: TROUBLESHOOTING.md
- **Récapitulatif**: WHAT_WAS_DONE.md
- **API Docs**: http://localhost:8000/docs

---

## 👤 Comptes de Test

```
Admin:
- Matricule: ADM001
- Password: admin123

Personnel:
- Matricule: PER001
- Password: personnel123

Étudiant:
- Matricule: ETU001
- Password: etudiant123
```

---

## 🎯 URLs Locales

- Frontend: http://localhost:5176
- Backend API: http://localhost:8000
- API Swagger: http://localhost:8000/docs
- API ReDoc: http://localhost:8000/redoc
- Prometheus: http://localhost:8001

---

**Gardez ce fichier à portée de main! 📌**
