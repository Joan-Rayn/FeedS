// Export de tous les services API
export { default as authService } from './authService';
export { default as feedbackService } from './feedbackService';
export { default as categoriesService } from './categoriesService';
export { default as usersService } from './usersService';

// Configuration globale d'axios
import axios from 'axios';

// Configuration par défaut pour tous les appels API
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Intercepteur global pour gérer les erreurs
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gestion globale des erreurs
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      // Accès refusé
      console.error('Accès refusé:', error.response.data);
    } else if (error.response?.status >= 500) {
      // Erreur serveur
      console.error('Erreur serveur:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

// Utilitaires pour les services
export const apiUtils = {
  // Formater les erreurs pour l'affichage
  formatError(error) {
    if (error.response?.data?.detail) {
      return error.response.data.detail;
    } else if (error.response?.data?.message) {
      return error.response.data.message;
    } else if (error.message) {
      return error.message;
    }
    return 'Une erreur inattendue s\'est produite';
  },

  // Créer des paramètres de requête
  createQueryParams(params) {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        searchParams.append(key, params[key]);
      }
    });
    return searchParams.toString();
  },

  // Gérer les téléchargements de fichiers
  downloadFile(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};