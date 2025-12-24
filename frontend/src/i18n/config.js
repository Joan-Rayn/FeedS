import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

const resources = {
  fr: {
    translation: {
      // Navigation
      "Dashboard": "Tableau de bord",
      "Feedbacks": "Feedbacks",
      "New Feedback": "Nouveau Feedback",
      "Statistics": "Statistiques",
      "Administration": "Administration",
      "Users": "Utilisateurs",
      "Profile": "Profil",
      "Logout": "Se déconnecter",

      // Common
      "Loading...": "Chargement...",
      "Error": "Erreur",
      "Success": "Succès",
      "Cancel": "Annuler",
      "Save": "Enregistrer",
      "Delete": "Supprimer",
      "Edit": "Modifier",
      "View": "Voir",
      "Search": "Rechercher",
      "Filter": "Filtrer",
      "Sort": "Trier",

      // Feedback
      "Title": "Titre",
      "Description": "Description",
      "Category": "Catégorie",
      "Status": "Statut",
      "Priority": "Priorité",
      "Created": "Créé",
      "Updated": "Mis à jour",

      // Status
      "Open": "Ouvert",
      "In Progress": "En cours",
      "Resolved": "Résolu",
      "Closed": "Fermé",

      // Priority
      "Low": "Faible",
      "Medium": "Moyen",
      "High": "Élevé",

      // Messages
      "Feedback created successfully": "Feedback créé avec succès",
      "Feedback updated successfully": "Feedback mis à jour avec succès",
      "Feedback deleted successfully": "Feedback supprimé avec succès",
      "Are you sure you want to delete this feedback?": "Êtes-vous sûr de vouloir supprimer ce feedback ?",

      // Auth
      "Login": "Connexion",
      "Register": "Inscription",
      "Email": "Email",
      "Password": "Mot de passe",
      "Confirm Password": "Confirmer le mot de passe",
      "First Name": "Prénom",
      "Last Name": "Nom",
      "Date of Birth": "Date de naissance",
      "Student ID": "Matricule",

      // Theme
      "Light": "Clair",
      "Dark": "Sombre",
      "Theme": "Thème",

      // PWA
      "Install App": "Installer l'application",
      "Offline": "Hors ligne",
      "Online": "En ligne",

      // Errors
      "Network Error": "Erreur réseau",
      "Server Error": "Erreur serveur",
      "Not Found": "Non trouvé",
      "Unauthorized": "Non autorisé",
      "Forbidden": "Interdit"
    }
  },
  en: {
    translation: {
      // Navigation
      "Dashboard": "Dashboard",
      "Feedbacks": "Feedbacks",
      "New Feedback": "New Feedback",
      "Statistics": "Statistics",
      "Administration": "Administration",
      "Users": "Users",
      "Profile": "Profile",
      "Logout": "Logout",

      // Common
      "Loading...": "Loading...",
      "Error": "Error",
      "Success": "Success",
      "Cancel": "Cancel",
      "Save": "Save",
      "Delete": "Delete",
      "Edit": "Edit",
      "View": "View",
      "Search": "Search",
      "Filter": "Filter",
      "Sort": "Sort",

      // Feedback
      "Title": "Title",
      "Description": "Description",
      "Category": "Category",
      "Status": "Status",
      "Priority": "Priority",
      "Created": "Created",
      "Updated": "Updated",

      // Status
      "Open": "Open",
      "In Progress": "In Progress",
      "Resolved": "Resolved",
      "Closed": "Closed",

      // Priority
      "Low": "Low",
      "Medium": "Medium",
      "High": "High",

      // Messages
      "Feedback created successfully": "Feedback created successfully",
      "Feedback updated successfully": "Feedback updated successfully",
      "Feedback deleted successfully": "Feedback deleted successfully",
      "Are you sure you want to delete this feedback?": "Are you sure you want to delete this feedback?",

      // Auth
      "Login": "Login",
      "Register": "Register",
      "Email": "Email",
      "Password": "Password",
      "Confirm Password": "Confirm Password",
      "First Name": "First Name",
      "Last Name": "Last Name",
      "Date of Birth": "Date of Birth",
      "Student ID": "Student ID",

      // Theme
      "Light": "Light",
      "Dark": "Dark",
      "Theme": "Theme",

      // PWA
      "Install App": "Install App",
      "Offline": "Offline",
      "Online": "Online",

      // Errors
      "Network Error": "Network Error",
      "Server Error": "Server Error",
      "Not Found": "Not Found",
      "Unauthorized": "Unauthorized",
      "Forbidden": "Forbidden"
    }
  }
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    debug: process.env.NODE_ENV === 'development',

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
  });

export default i18n;