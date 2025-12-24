@echo off
echo ============================================
echo    🚀 Déploiement FeedS avec Docker
echo ============================================

echo.
echo 📋 Vérification des prérequis...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker n'est pas installé ou n'est pas accessible.
    echo Veuillez installer Docker depuis https://docker.com
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose n'est pas installé.
    echo Veuillez installer Docker Compose.
    pause
    exit /b 1
)

echo ✅ Docker et Docker Compose sont installés.

echo.
echo 🏗️ Construction et démarrage des services...
docker-compose down
docker-compose up -d --build

echo.
echo ⏳ Attente du démarrage des services (30 secondes)...
timeout /t 30 /nobreak > nul

echo.
echo 🔍 Vérification de l'état des services...
docker-compose ps

echo.
echo 📊 Vérification de la santé des services...
echo.
echo Testing backend health...
curl -f http://localhost:8000/api/v1/metrics/health >nul 2>&1
if errorlevel 1 (
    echo ❌ Backend ne répond pas.
) else (
    echo ✅ Backend opérationnel.
)

echo.
echo Testing database connection...
docker-compose exec -T postgres pg_isready -U feeds_user -d feeds_db >nul 2>&1
if errorlevel 1 (
    echo ❌ Base de données inaccessible.
) else (
    echo ✅ Base de données opérationnelle.
)

echo.
echo 🌐 URLs d'accès :
echo    - Frontend: http://localhost:5176
echo    - Backend API: http://localhost:8000
echo    - Documentation API: http://localhost:8000/docs
echo    - Métriques: http://localhost:8000/api/v1/metrics
echo.
echo 🛠️ Commandes utiles :
echo    - Logs: docker-compose logs -f
echo    - Arrêter: docker-compose down
echo    - Redémarrer: docker-compose restart
echo.
echo ✅ Déploiement terminé !
echo.
pause