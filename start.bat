@echo off
echo ============================================
echo    🚀 Démarrage de FeedS Application
echo ============================================

echo.
echo 📦 Installation des dépendances backend...
cd backend
pip install -r requirements.txt

echo.
echo 🗄️  Configuration de la base de données...
python create_db.py
python populate_db.py

echo.
echo 🔧 Démarrage du backend...
start cmd /k "cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

echo.
echo ⌛ Attente du démarrage du backend (5 secondes)...
timeout /t 5 /nobreak > nul

echo.
echo 🎨 Installation des dépendances frontend...
cd ../frontend
npm install

echo.
echo 🌐 Démarrage du frontend...
start cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Application FeedS démarrée !
echo.
echo 🔗 URLs d'accès :
echo    - Frontend: http://localhost:5176
echo    - Backend API: http://localhost:8000
echo    - Documentation API: http://localhost:8000/docs
echo.
echo 📊 Métriques: http://localhost:8001
echo.
pause