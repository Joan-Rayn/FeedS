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

const categoriesService = {
  // Récupérer toutes les catégories
  async getAllCategories() {
    const response = await api.get('/categories');
    return response.data;
  },

  // Récupérer une catégorie par ID
  async getCategoryById(id) {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  // Créer une nouvelle catégorie (admin seulement)
  async createCategory(categoryData) {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  // Mettre à jour une catégorie (admin seulement)
  async updateCategory(id, categoryData) {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  // Supprimer une catégorie (admin seulement)
  async deleteCategory(id) {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },

  // Récupérer les statistiques d'une catégorie
  async getCategoryStats(id) {
    const response = await api.get(`/categories/${id}/stats`);
    return response.data;
  },

  // Récupérer les feedbacks d'une catégorie
  async getCategoryFeedbacks(id, params = {}) {
    const response = await api.get(`/categories/${id}/feedbacks`, { params });
    return response.data;
  },
};

export default categoriesService;