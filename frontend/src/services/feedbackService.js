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

const feedbackService = {
  // Récupérer tous les feedbacks
  async getAllFeedbacks(params = {}) {
    const response = await api.get('/feedbacks', { params });
    return response.data;
  },

  // Récupérer les feedbacks de l'utilisateur connecté
  async getUserFeedbacks() {
    const response = await api.get('/feedbacks/my');
    return response.data;
  },

  // Récupérer un feedback par ID
  async getFeedbackById(id) {
    const response = await api.get(`/feedbacks/${id}`);
    return response.data;
  },

  // Créer un nouveau feedback
  async createFeedback(feedbackData) {
    const response = await api.post('/feedbacks', feedbackData);
    return response.data;
  },

  // Mettre à jour un feedback
  async updateFeedback(id, feedbackData) {
    const response = await api.put(`/feedbacks/${id}`, feedbackData);
    return response.data;
  },

  // Supprimer un feedback
  async deleteFeedback(id) {
    const response = await api.delete(`/feedbacks/${id}`);
    return response.data;
  },

  // Changer le statut d'un feedback
  async updateFeedbackStatus(id, status) {
    const response = await api.patch(`/feedbacks/${id}/status`, { status });
    return response.data;
  },

  // Assigner un feedback à un utilisateur
  async assignFeedback(id, userId) {
    const response = await api.patch(`/feedbacks/${id}/assign`, { user_id: userId });
    return response.data;
  },

  // Ajouter une réponse à un feedback
  async addResponse(feedbackId, content) {
    const response = await api.post(`/feedbacks/${feedbackId}/responses`, { content });
    return response.data;
  },

  // Récupérer les réponses d'un feedback
  async getFeedbackResponses(feedbackId) {
    const response = await api.get(`/feedbacks/${feedbackId}/responses`);
    return response.data;
  },

  // Upload d'une pièce jointe
  async uploadAttachment(feedbackId, file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`/feedbacks/${feedbackId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Récupérer les pièces jointes d'un feedback
  async getFeedbackAttachments(feedbackId) {
    const response = await api.get(`/feedbacks/${feedbackId}/attachments`);
    return response.data;
  },

  // Supprimer une pièce jointe
  async deleteAttachment(attachmentId) {
    const response = await api.delete(`/attachments/${attachmentId}`);
    return response.data;
  },

  // Rechercher des feedbacks
  async searchFeedbacks(query, filters = {}) {
    const params = { q: query, ...filters };
    const response = await api.get('/feedbacks/search', { params });
    return response.data;
  },

  // Récupérer les statistiques des feedbacks
  async getFeedbackStats() {
    const response = await api.get('/feedbacks/stats');
    return response.data;
  },
};

export default feedbackService;