import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_URL = `${API_BASE_URL}/api/v1`;

// Configuration d'axios avec intercepteurs
const api = axios.create({
  baseURL: API_URL,
});

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const authService = {
  // Connexion
  async login(credentials) {
    const formData = new URLSearchParams();
    formData.append('username', credentials.matricule);
    formData.append('password', credentials.password);
    
    const response = await axios.post(`${API_URL}/auth/login`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    
    return response.data;
  },

  // Inscription
  async register(userData) {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  },

  // Récupération des informations de l'utilisateur connecté
  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Réinitialisation du mot de passe
  async resetPassword(matricule) {
    const response = await axios.post(`${API_URL}/auth/reset-password`, {
      matricule,
    });
    return response.data;
  },

  // Déconnexion
  logout() {
    localStorage.removeItem('token');
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  // Obtenir le token
  getToken() {
    return localStorage.getItem('token');
  },
};

export default authService;