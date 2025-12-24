#!/usr/bin/env python3
"""
Script de test pour créer un utilisateur via l'API.
"""

import requests
import json

# URL de base
BASE_URL = 'http://localhost:8000/api/v1'

def test_create_user():
    # D'abord, se connecter en tant qu'admin
    login_data = {
        'username': 'ADMIN001',
        'password': 'admin123'
    }

    print("🔐 Connexion en tant qu'admin...")
    login_response = requests.post(f'{BASE_URL}/auth/login', json=login_data)

    if login_response.status_code != 200:
        print(f"❌ Échec de connexion: {login_response.status_code}")
        print(login_response.text)
        return

    token = login_response.json()['access_token']
    headers = {'Authorization': f'Bearer {token}'}

    print("✅ Connexion réussie")

    # Créer un nouvel utilisateur
    user_data = {
        'matricule': 'TEST001',
        'nom': 'Test',
        'prenom': 'User',
        'date_naissance': '1990-01-01',
        'email': 'test@example.com',
        'password': 'test123',
        'role': 'etudiant'
    }

    print("👤 Création d'un utilisateur de test...")
    create_response = requests.post(f'{BASE_URL}/users', json=user_data, headers=headers)

    print(f"Status: {create_response.status_code}")
    if create_response.status_code == 200:
        print("✅ Utilisateur créé avec succès!")
        print(json.dumps(create_response.json(), indent=2))
    else:
        print("❌ Échec de création:")
        print(create_response.text)

if __name__ == "__main__":
    test_create_user()