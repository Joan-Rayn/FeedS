Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   🚀 Démarrage de FeedS Application" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "📦 Installation des dépendances backend..." -ForegroundColor Yellow
Set-Location backend
pip install -r requirements.txt

Write-Host ""
Write-Host "🗄️  Configuration de la base de données..." -ForegroundColor Yellow
python create_db.py
python populate_db.py

Write-Host ""
Write-Host "🔧 Démarrage du backend..." -ForegroundColor Yellow
Start-Process -FilePath "cmd" -ArgumentList "/k cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000" -NoNewWindow

Write-Host ""
Write-Host "⌛ Attente du démarrage du backend (5 secondes)..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "🎨 Installation des dépendances frontend..." -ForegroundColor Yellow
Set-Location ../frontend
npm install

Write-Host ""
Write-Host "🌐 Démarrage du frontend..." -ForegroundColor Yellow
Start-Process -FilePath "cmd" -ArgumentList "/k cd frontend && npm run dev" -NoNewWindow

Write-Host ""
Write-Host "✅ Application FeedS démarrée !" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 URLs d'accès :" -ForegroundColor Green
Write-Host "   - Frontend: http://localhost:5176" -ForegroundColor White
Write-Host "   - Backend API: http://localhost:8000" -ForegroundColor White
Write-Host "   - Documentation API: http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "📊 Métriques: http://localhost:8001" -ForegroundColor White
Write-Host ""

Read-Host "Appuyez sur Entrée pour continuer"