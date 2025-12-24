import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

// Configuration d'axios avec intercepteurs
const api = axios.create({
  baseURL: API_BASE_URL,
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

const usersService = {
  // Récupérer tous les utilisateurs (admin seulement)
  async getAllUsers(params = {}) {
    const response = await api.get('/users', { params });
    return response.data;
  },

  // Récupérer un utilisateur par ID
  async getUserById(id) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Créer un nouvel utilisateur (admin seulement)
  async createUser(userData) {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // Mettre à jour un utilisateur
  async updateUser(id, userData) {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Mettre à jour le profil de l'utilisateur connecté
  async updateProfile(userData) {
    const response = await api.put('/users/me', userData);
    return response.data;
  },

  // Supprimer un utilisateur (admin seulement)
  async deleteUser(id) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Activer/désactiver un utilisateur (admin seulement)
  async toggleUserStatus(id, isActive) {
    const response = await api.patch(`/users/${id}/status`, { is_active: isActive });
    return response.data;
  },

  // Changer le rôle d'un utilisateur (admin seulement)
  async changeUserRole(id, role) {
    const response = await api.patch(`/users/${id}/role`, { role });
    return response.data;
  },

  // Changer le mot de passe de l'utilisateur connecté
  async changePassword(currentPassword, newPassword) {
    const response = await api.patch('/users/me/password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  // Récupérer les statistiques d'un utilisateur
  async getUserStats(id) {
    const response = await api.get(`/users/${id}/stats`);
    return response.data;
  },

  // Récupérer les feedbacks d'un utilisateur
  async getUserFeedbacks(id, params = {}) {
    const response = await api.get(`/users/${id}/feedbacks`, { params });
    return response.data;
  },

  // Récupérer les notifications de l'utilisateur connecté
  async getUserNotifications() {
    const response = await api.get('/users/me/notifications');
    return response.data;
  },

  // Marquer une notification comme lue
  async markNotificationAsRead(notificationId) {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Marquer toutes les notifications comme lues
  async markAllNotificationsAsRead() {
    const response = await api.patch('/notifications/mark-all-read');
    return response.data;
  },

  // Rechercher des utilisateurs (admin seulement)
  async searchUsers(query, filters = {}) {
    const params = { q: query, ...filters };
    const response = await api.get('/users/search', { params });
    return response.data;
  },

  // Récupérer les utilisateurs par rôle
  async getUsersByRole(role) {
    const response = await api.get(`/users/role/${role}`);
    return response.data;
  },

  // Exporter les données utilisateur (RGPD)
  async exportUserData() {
    const response = await api.get('/users/me/export', {
      responseType: 'blob',
    });
    return response.data;
  },

  // Supprimer les données utilisateur (RGPD)
  async deleteUserData() {
    const response = await api.delete('/users/me/data');
    return response.data;
  },
};

export default usersService;