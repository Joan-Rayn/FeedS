#!/bin/bash

echo "============================================"
echo "   🚀 Déploiement FeedS avec Docker"
echo "============================================"

echo ""
echo "📋 Vérification des prérequis..."

# Vérifier Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé ou n'est pas accessible."
    echo "Veuillez installer Docker depuis https://docker.com"
    exit 1
fi

# Vérifier Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé."
    echo "Veuillez installer Docker Compose."
    exit 1
fi

echo "✅ Docker et Docker Compose sont installés."

echo ""
echo "🏗️ Construction et démarrage des services..."

# Arrêter les services existants
docker-compose down

# Démarrer les services
docker-compose up -d --build

echo ""
echo "⏳ Attente du démarrage des services (30 secondes)..."
sleep 30

echo ""
echo "🔍 Vérification de l'état des services..."
docker-compose ps

echo ""
echo "📊 Vérification de la santé des services..."

echo ""
echo "Testing backend health..."
if curl -f http://localhost:8000/api/v1/metrics/health &> /dev/null; then
    echo "✅ Backend opérationnel."
else
    echo "❌ Backend ne répond pas."
fi

echo ""
echo "Testing database connection..."
if docker-compose exec -T postgres pg_isready -U feeds_user -d feeds_db &> /dev/null; then
    echo "✅ Base de données opérationnelle."
else
    echo "❌ Base de données inaccessible."
fi

echo ""
echo "🌐 URLs d'accès :"
echo "   - Frontend: http://localhost:5176"
echo "   - Backend API: http://localhost:8000"
echo "   - Documentation API: http://localhost:8000/docs"
echo "   - Métriques: http://localhost:8000/api/v1/metrics"
echo ""
echo "🛠️ Commandes utiles :"
echo "   - Logs: docker-compose logs -f"
echo "   - Arrêter: docker-compose down"
echo "   - Redémarrer: docker-compose restart"
echo ""
echo "✅ Déploiement terminé !"