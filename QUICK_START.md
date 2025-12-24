# 🚀 Guide de Démarrage Complet - FeedS Application

Ce guide vous permettra de lancer l'application FeedS localement en quelques minutes.

## 📋 Prérequis

- **Python 3.11+** installé
- **Node.js 18+** et npm installés
- **PostgreSQL** installé et en cours d'exécution
- **Git** (optionnel)

## 🔧 Installation et Configuration

### Étape 1: Configuration PostgreSQL

1. Démarrez PostgreSQL
2. Créez un utilisateur et une base de données:

```sql
-- Ouvrez psql ou pgAdmin et exécutez:
CREATE USER postgres WITH PASSWORD 'password';
CREATE DATABASE feeds_db OWNER postgres;
GRANT ALL PRIVILEGES ON DATABASE feeds_db TO postgres;
```

### Étape 2: Configuration Backend

1. Ouvrez un terminal et naviguez vers le dossier backend:
```bash
cd backend
```

2. Installez les dépendances Python:
```bash
pip install -r requirements.txt
```

3. Créez et peuplez la base de données:
```bash
python create_db.py
python populate_db.py
```

4. Créez un fichier `.env` dans `backend/app/` (optionnel):
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/feeds_db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

### Étape 3: Configuration Frontend

1. Ouvrez un NOUVEAU terminal et naviguez vers le dossier frontend:
```bash
cd frontend
```

2. Installez les dépendances Node:
```bash
npm install
```

3. Vérifiez le fichier `.env`:
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_ENV=development
VITE_PWA_ENABLED=true
```

### Étape 4: Générer les Icônes PWA

1. Ouvrez le fichier `generate-icons.html` dans votre navigateur
2. Cliquez sur "Générer toutes les icônes"
3. Téléchargez toutes les icônes
4. Placez-les dans `frontend/public/icons/`

## 🚀 Lancement de l'Application

### Option 1: Script Automatique (Windows)

Double-cliquez sur `start.ps1` ou `start.bat` à la racine du projet.

### Option 2: Démarrage Manuel

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## 🌐 Accès à l'Application

Une fois démarrée, l'application est accessible aux URLs suivantes:

- **Frontend**: http://localhost:5176
- **Backend API**: http://localhost:8000
- **Documentation API (Swagger)**: http://localhost:8000/docs
- **Documentation API (ReDoc)**: http://localhost:8000/redoc
- **Métriques Prometheus**: http://localhost:8001

## 👥 Comptes de Test

Après avoir exécuté `populate_db.py`, vous aurez ces comptes:

### Admin
- **Matricule**: `ADM001`
- **Password**: `admin123`

### Personnel
- **Matricule**: `PER001`
- **Password**: `personnel123`

### Étudiant
- **Matricule**: `ETU001`
- **Password**: `etudiant123`

## ✅ Vérification du Fonctionnement

1. **Backend**: 
   - Ouvrez http://localhost:8000
   - Vous devriez voir: `{"message": "Welcome to FeedS API", "version": "1.0.0", ...}`

2. **Frontend**:
   - Ouvrez http://localhost:5176
   - La page de login devrait s'afficher

3. **Test de Connexion**:
   - Utilisez les identifiants admin ci-dessus
   - Vous devriez être redirigé vers le dashboard

## 🐛 Dépannage

### Problème: Backend ne démarre pas

**Erreur de connexion PostgreSQL**:
```bash
# Vérifiez que PostgreSQL est démarré
# Windows: Services > PostgreSQL
# Vérifiez les identifiants dans DATABASE_URL
```

**Port 8000 déjà utilisé**:
```bash
# Tuez le processus sur le port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Problème: Frontend ne démarre pas

**Erreur CORS**:
- Vérifiez que le backend tourne sur le port 8000
- Vérifiez VITE_API_BASE_URL dans .env

**Port 5176 déjà utilisé**:
```bash
# Le frontend utilisera automatiquement un autre port
# Vérifiez le message dans le terminal
```

### Problème: Erreur 401 lors de la connexion

1. Vérifiez que la base de données est peuplée
2. Réexécutez `python populate_db.py`
3. Vérifiez que les mots de passe correspondent

## 📱 Test PWA

1. Ouvrez Chrome/Edge DevTools (F12)
2. Allez dans l'onglet "Application"
3. Vérifiez "Service Workers" - doit être enregistré
4. Vérifiez "Manifest" - doit charger le manifest.json
5. Testez l'installation: Menu > Installer l'application

## 🎯 Fonctionnalités à Tester

- ✅ Connexion / Déconnexion
- ✅ Création de compte étudiant
- ✅ Création de feedback (étudiant)
- ✅ Réponse à un feedback (admin/personnel)
- ✅ Gestion des utilisateurs (admin)
- ✅ Statistiques (admin/personnel)
- ✅ Recherche de feedbacks
- ✅ Notifications temps réel
- ✅ Mode hors ligne (PWA)

## 📞 Support

En cas de problème, consultez:
1. `TROUBLESHOOTING.md` pour les problèmes courants
2. Logs du backend dans le terminal
3. Console du navigateur (F12) pour les erreurs frontend

---

**Bon développement avec FeedS! 🚀**
