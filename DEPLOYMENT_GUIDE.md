# 🚀 Guide de Déploiement Complet sur Render

Ce guide détaille toutes les étapes pour déployer FeedS sur Render.com (gratuit).

## 📋 Prérequis

1. Compte GitHub (pour connecter le repository)
2. Compte Render.com (gratuit)
3. Repository FeedS pushé sur GitHub

---

## 🗄️ Étape 1: Créer la Base de Données PostgreSQL

1. Connectez-vous à [Render.com](https://render.com)
2. Cliquez sur **"New +"** → **"PostgreSQL"**
3. Configuration:
   - **Name**: `feeds-postgres`
   - **Database**: `feeds_db`
   - **User**: `feeds_user`
   - **Region**: Choisissez le plus proche (ex: Frankfurt)
   - **Plan**: Free
4. Cliquez sur **"Create Database"**
5. **IMPORTANT**: Notez l'**Internal Database URL** (commence par `postgresql://...`)

---

## 🔧 Étape 2: Déployer le Backend

### 2.1 Créer le Service Web Backend

1. Cliquez sur **"New +"** → **"Web Service"**
2. Connectez votre repository GitHub `FeedS`
3. Configuration:

#### Build & Deploy
- **Name**: `feeds-backend`
- **Region**: Même région que la database
- **Branch**: `master` (ou `main`)
- **Root Directory**: `backend`
- **Runtime**: `Python 3`
- **Build Command**:
  ```bash
  pip install -r requirements.txt && python create_db.py && python populate_db.py
  ```
- **Start Command**:
  ```bash
  uvicorn app.main:app --host 0.0.0.0 --port $PORT
  ```

#### Environment
- **Plan**: Free

### 2.2 Configurer les Variables d'Environnement

Dans l'onglet **"Environment"**, ajoutez ces variables:

| Variable | Valeur |
|----------|--------|
| `DATABASE_URL` | Collez l'**Internal Database URL** de l'étape 1 |
| `SECRET_KEY` | Générez une clé: `openssl rand -hex 32` |
| `ALGORITHM` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` |
| `UPLOAD_DIRECTORY` | `/tmp/uploads` |
| `MAX_UPLOAD_SIZE` | `10485760` |
| `PYTHON_VERSION` | `3.11.0` |

**Variables Optionnelles** (recommandées):
| Variable | Valeur | Description |
|----------|--------|-------------|
| `REDIS_HOST` | Laissez vide | Cache (optionnel) |
| `SENTRY_DSN` | Votre DSN Sentry | Error tracking |
| `CORS_ORIGINS` | `*` | Permet tous les origins |

### 2.3 Configurer le Health Check

- **Health Check Path**: `/api/v1/metrics/health`

### 2.4 Déployer

Cliquez sur **"Create Web Service"**

⏳ Le déploiement prendra 5-10 minutes.

### 2.5 Vérifier le Backend

Une fois déployé, votre backend sera accessible à:
```
https://feeds-backend-XXXX.onrender.com
```

Testez-le:
```bash
curl https://feeds-backend-XXXX.onrender.com/api/v1/metrics/health
```

Vous devriez voir:
```json
{
  "status": "healthy",
  "database": "connected",
  ...
}
```

**Documentation API**:
- Swagger: `https://feeds-backend-XXXX.onrender.com/docs`
- ReDoc: `https://feeds-backend-XXXX.onrender.com/redoc`

---

## 🎨 Étape 3: Déployer le Frontend

### 3.1 Générer les Icônes PWA (Important!)

**Avant de déployer**, générez les icônes PWA:

1. Ouvrez `generate-icons.html` dans votre navigateur
2. Cliquez sur **"Générer toutes les icônes"**
3. Téléchargez toutes les icônes (8 fichiers)
4. Placez-les dans `frontend/public/icons/`
5. Commitez et pushez:
   ```bash
   git add frontend/public/icons/*.png
   git commit -m "Add PWA icons"
   git push
   ```

### 3.2 Créer le Site Statique Frontend

1. Cliquez sur **"New +"** → **"Static Site"**
2. Connectez le même repository GitHub
3. Configuration:

#### Build & Deploy
- **Name**: `feeds-frontend`
- **Branch**: `master` (ou `main`)
- **Root Directory**: `frontend`
- **Build Command**:
  ```bash
  npm install && npm run build
  ```
- **Publish Directory**: `dist`

### 3.3 Configurer les Variables d'Environnement

| Variable | Valeur |
|----------|--------|
| `VITE_API_BASE_URL` | `https://feeds-backend-XXXX.onrender.com` ⚠️ |
| `VITE_APP_ENV` | `production` |
| `VITE_PWA_ENABLED` | `true` |

⚠️ **IMPORTANT**: Remplacez `XXXX` par votre vrai URL backend de l'étape 2.5!

### 3.4 Configurer les Redirects (Important pour React Router)

Dans l'onglet **"Redirects/Rewrites"**, ajoutez:

**Source**: `/*`
**Destination**: `/index.html`
**Action**: `Rewrite`

### 3.5 Configurer les Headers (Optionnel mais recommandé)

Pour améliorer la sécurité et le PWA:

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
  Cache-Control: public, max-age=31536000, immutable
```

### 3.6 Déployer

Cliquez sur **"Create Static Site"**

⏳ Le déploiement prendra 3-5 minutes.

---

## ✅ Étape 4: Vérification Post-Déploiement

### 4.1 Tester le Frontend

Ouvrez votre URL frontend:
```
https://feeds-frontend-XXXX.onrender.com
```

Vous devriez voir la page de login de FeedS.

### 4.2 Tester la Connexion

Utilisez les comptes de test créés par `populate_db.py`:

**Admin**:
- Matricule: `ADM001`
- Password: `admin123`

**Personnel**:
- Matricule: `PER001`
- Password: `personnel123`

**Étudiant**:
- Matricule: `ETU001`
- Password: `etudiant123`

### 4.3 Tester les Fonctionnalités

- ✅ Connexion/déconnexion
- ✅ Création de feedback
- ✅ Réponse à un feedback (admin/personnel)
- ✅ Notifications
- ✅ Recherche

### 4.4 Tester le PWA

1. Ouvrez l'application dans Chrome/Edge
2. Regardez la barre d'adresse: vous devriez voir une icône d'installation
3. Cliquez sur "Installer"
4. L'application s'ouvre en mode standalone!

---

## 🐛 Dépannage

### Backend ne démarre pas

**Erreur Database Connection**:
1. Vérifiez que la database est bien créée
2. Vérifiez que `DATABASE_URL` est correct dans les variables d'environnement
3. Consultez les logs: Settings → Logs

**Erreur Build**:
1. Vérifiez que `requirements.txt` est présent
2. Vérifiez la commande de build
3. Consultez les logs de build

### Frontend ne se connecte pas au Backend

**Erreur CORS**:
1. Vérifiez `VITE_API_BASE_URL` dans les variables d'environnement frontend
2. Assurez-vous que l'URL backend est correcte (avec `https://`)
3. Vérifiez les logs backend pour les erreurs CORS

**Erreur 404**:
1. Vérifiez que le redirect `/*` → `/index.html` est configuré
2. Redéployez le frontend

### PWA ne s'installe pas

**Manifest ou Service Worker non trouvé**:
1. Vérifiez que les icônes PWA sont bien dans `frontend/public/icons/`
2. Vérifiez que `manifest.json` existe
3. Vérifiez la console du navigateur (F12)
4. Rebuild le frontend

---

## 🔄 Mises à Jour

Pour mettre à jour l'application après modifications:

1. Commitez et pushez vos changements sur GitHub
2. Render détectera automatiquement les changements
3. Les services se redéploieront automatiquement

Ou manuellement:
- Dashboard Render → Service → **"Manual Deploy"** → **"Deploy latest commit"**

---

## 💰 Limitations du Plan Gratuit Render

⚠️ **Important à savoir**:

- **Inactivité**: Les services gratuits se mettent en veille après 15 min d'inactivité
- **Redémarrage**: Premier accès après veille = 30-60 secondes de chargement
- **Database**: 90 jours de rétention, puis suppression si inactif
- **Bandwidth**: 100 GB/mois
- **Build Minutes**: 500 min/mois

**Solutions**:
- **Pinger le service**: Utilisez [UptimeRobot](https://uptimerobot.com) (gratuit) pour pinger votre backend toutes les 5 minutes
- **Plan payant**: $7/mois pour éviter la veille

---

## 🎉 Félicitations!

Votre application FeedS est maintenant déployée et accessible dans le monde entier!

### URLs Finales

- **Frontend**: `https://feeds-frontend-XXXX.onrender.com`
- **Backend**: `https://feeds-backend-XXXX.onrender.com`
- **API Docs**: `https://feeds-backend-XXXX.onrender.com/docs`

### Prochaines Étapes

1. 📧 Configurez l'envoi d'emails (SMTP)
2. 🔔 Configurez les notifications push
3. 📊 Configurez Sentry pour le monitoring
4. 🎨 Personnalisez le design avec votre branding
5. 📱 Testez sur différents appareils

---

## 📞 Support

- Documentation complète: `README.md`
- Guide de démarrage local: `QUICK_START.md`
- Problèmes courants: `TROUBLESHOOTING.md`

**Besoin d'aide?**
- Consultez les logs Render
- Vérifiez la console navigateur (F12)
- Consultez la documentation FastAPI et React

---

**Bon déploiement! 🚀**
