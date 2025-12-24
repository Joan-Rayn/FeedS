# 🚀 Guide de Dépannage FeedS

## Problèmes Courants et Solutions

### 1. Erreur "Connection Refused" / Backend non accessible
**Symptôme :** `ERR_CONNECTION_REFUSED` sur localhost:8000

**Solutions :**
```bash
# Aller dans le dossier backend
cd backend

# Installer les dépendances
pip install -r requirements.txt

# Lancer le serveur
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Erreur CORS
**Symptôme :** "No 'Access-Control-Allow-Origin' header is present"

**Solution :** Les origines CORS ont été mises à jour pour inclure le port 5176.

### 3. Erreur bcrypt/passlib
**Symptôme :** "trapped) error reading bcrypt version"

**Solution :**
```bash
pip install --upgrade bcrypt passlib
```

### 4. Base de données non accessible
**Symptôme :** Erreurs de connexion PostgreSQL

**Vérifications :**
- PostgreSQL est-il démarré ?
- La base `feeds_db` existe-t-elle ?
- Les identifiants sont-ils corrects dans `.env` ?

**Solutions :**
```bash
# Créer la base de données
python backend/create_db.py

# Peupler la base
python backend/populate_db.py
```

### 5. Port déjà utilisé
**Symptôme :** "Port 8000 already in use"

**Solution :**
```bash
# Tuer les processus sur le port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Ou utiliser un autre port
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

## Démarrage Rapide

### Option 1 : Script Automatique (Windows)
Double-cliquez sur `start.bat` ou `start.ps1` à la racine du projet.

### Option 2 : Démarrage Manuel

**Terminal 1 - Backend :**
```bash
cd backend
pip install -r requirements.txt
python create_db.py
python populate_db.py
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend :**
```bash
cd frontend
npm install
npm run dev
```

## URLs d'Accès

- **Frontend :** http://localhost:5176
- **Backend API :** http://localhost:8000
- **Documentation API :** http://localhost:8000/docs
- **Métriques :** http://localhost:8001

## Tests de Fonctionnement

1. **Backend :** Ouvrez http://localhost:8000/docs
2. **Frontend :** Ouvrez http://localhost:5176
3. **Connexion :** Essayez de vous connecter avec un compte existant

## Logs et Debugging

- Les logs du backend apparaissent dans la console
- Pour plus de détails : `uvicorn app.main:app --reload --log-level debug`
- Vérifiez les erreurs dans la console du navigateur (F12)

## Support

Si les problèmes persistent :
1. Vérifiez que PostgreSQL est démarré
2. Redémarrez votre ordinateur
3. Supprimez les dossiers `__pycache__` et `node_modules`
4. Réinstallez les dépendances