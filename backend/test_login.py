"""
Test de connexion avec les différents comptes
"""
import requests
import json

API_URL = "http://localhost:8000/api/v1"

# Comptes de test
accounts = [
    ("ADMIN001", "admin123", "Admin"),
    ("PER001", "personnel123", "Personnel"),  
    ("ETU001", "etudiant123", "Étudiant"),
]

print("\n" + "="*60)
print("🔐 TEST DE CONNEXION")
print("="*60 + "\n")

for matricule, password, role_name in accounts:
    print(f"Testing {role_name}: {matricule}")
    
    try:
        # OAuth2PasswordRequestForm attend des données de formulaire, pas du JSON
        response = requests.post(
            f"{API_URL}/auth/login",
            data={"username": matricule, "password": password}  # Utiliser 'data' au lieu de 'json' et 'username' au lieu de 'matricule'
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"  ✅ Connexion réussie!")
            print(f"     Token: {data['access_token'][:50]}...")
            print(f"     Role: {data.get('user', {}).get('role', 'N/A')}")
        else:
            print(f"  ❌ Échec: {response.status_code}")
            print(f"     {response.json()}")
            
    except Exception as e:
        print(f"  ❌ Erreur: {e}")
    
    print()

print("="*60)
