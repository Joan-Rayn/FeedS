# 🚀 FeedS - Déploiement Docker

Ce guide explique comment déployer FeedS avec Docker et Docker Compose.

## 📋 Prérequis

- Docker >= 20.10
- Docker Compose >= 2.0

## 🏗️ Architecture Docker

```
FeedS Application
├── postgres (PostgreSQL 15) - Base de données
├── redis (Redis 7) - Cache et sessions
├── backend (FastAPI) - API REST
└── frontend (React/Vite) - Interface utilisateur
```

## 🚀 Démarrage Rapide (Développement)

1. **Cloner le repository**
```bash
git clone <votre-repo>
cd FeedS
```

2. **Démarrer tous les services**
```bash
docker-compose up -d
```

3. **Vérifier que tout fonctionne**
```bash
docker-compose ps
docker-compose logs
```

4. **Accéder à l'application**
- Frontend: http://localhost:5176
- Backend API: http://localhost:8000
- Documentation API: http://localhost:8000/docs
- Base de données: localhost:5432

## 🛠️ Commandes Utiles

### Gestion des conteneurs
```bash
# Démarrer
docker-compose up -d

# Arrêter
docker-compose down

# Logs
docker-compose logs -f [service]

# Rebuild
docker-compose up -d --build

# Nettoyer
docker-compose down -v --remove-orphans
```

### Accès aux services
```bash
# Shell dans un conteneur
docker-compose exec backend bash
docker-compose exec postgres psql -U feeds_user -d feeds_db

# Voir les logs
docker-compose logs backend
docker-compose logs frontend
```

## 🌍 Déploiement en Production

1. **Créer un fichier `.env`**
```bash
cp .env.docker .env
# Éditer les variables selon votre environnement
```

2. **Démarrer en production**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

3. **Configuration des variables d'environnement**
```env
# Base de données
DB_PASSWORD=votre_mot_de_passe_prod

# Sécurité
SECRET_KEY=votre_clé_secrète_prod

# CORS
CORS_ORIGINS=https://votredomaine.com

# API Frontend
VITE_API_BASE_URL=https://api.votredomaine.com
```

## 🔧 Dépannage

### Problèmes courants

**Port déjà utilisé**
```bash
# Voir quels ports sont utilisés
docker-compose ps
netstat -ano | findstr :8000

# Changer les ports dans docker-compose.yml
ports:
  - "8001:8000"  # Change le port externe
```

**Base de données ne démarre pas**
```bash
# Vérifier les logs
docker-compose logs postgres

# Redémarrer la base
docker-compose restart postgres
```

**Conteneurs ne communiquent pas**
```bash
# Vérifier le réseau
docker network ls
docker network inspect feeds_main_feeds-network
```

### Logs et debugging
```bash
# Tous les logs
docker-compose logs

# Logs d'un service spécifique
docker-compose logs backend

# Suivre les logs en temps réel
docker-compose logs -f backend
```

## 📊 Monitoring

### Health checks
- Backend: http://localhost:8000/api/v1/metrics/health
- Base de données: `docker-compose exec postgres pg_isready -U feeds_user -d feeds_db`

### Métriques
- Prometheus: http://localhost:8000/api/v1/metrics
- Redis: `docker-compose exec redis redis-cli info`

## 🔄 Mise à jour

```bash
# Récupérer les dernières modifications
git pull

# Rebuild et redémarrer
docker-compose down
docker-compose up -d --build
```

## 🗂️ Structure des volumes

```
volumes:
  postgres_data:/var/lib/postgresql/data  # Données PostgreSQL
  redis_data:/data                        # Cache Redis
  ./backend/uploads:/app/uploads          # Fichiers uploadés
  ./backend/logs:/app/logs                # Logs application
```

## 🔒 Sécurité

- Utilisation d'utilisateurs non-root dans les conteneurs
- Secrets gérés via variables d'environnement
- Réseau isolé entre services
- Health checks automatiques

## 📈 Performance

- Images optimisées (slim, alpine)
- Cache de build Docker
- Volumes pour persister les données
- Health checks pour la disponibilité

---

**🎉 Avec Docker, votre déploiement FeedS est maintenant simplifié et reproductible !**