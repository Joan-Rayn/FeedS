import requests

# Test de l'endpoint users (nécessite token admin)
# D'abord on récupère un token admin
response = requests.post('http://localhost:8000/api/v1/auth/login', json={'username': 'ADMIN001', 'password': 'admin123'})
print('Login status:', response.status_code)

if response.status_code == 200:
    token = response.json()['access_token']
    headers = {'Authorization': f'Bearer {token}'}
    users_response = requests.get('http://localhost:8000/api/v1/users', headers=headers)
    print('Status users:', users_response.status_code)
    if users_response.status_code == 200:
        users_data = users_response.json()
        print('Users count:', len(users_data))
        print('Users data:', users_data)
    else:
        print('Users error:', users_response.text)
else:
    print('Login failed:', response.text)