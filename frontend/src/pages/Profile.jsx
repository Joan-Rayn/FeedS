import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';
import Layout from '../components/Layout';
import { Button } from '../components/design-system';
import { User, Mail, Calendar, Shield, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Déconnexion réussie');
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    const badges = {
      etudiant: { label: 'Étudiant', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
      personnel: { label: 'Personnel', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
      admin: { label: 'Administrateur', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' }
    };
    const badge = badges[role] || badges.etudiant;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${badge.color}`}>
        <Shield className="w-4 h-4 mr-1" />
        {badge.label}
      </span>
    );
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-1 flex items-center">
            <User className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
            Mon Profil
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Vos informations personnelles
          </p>
        </div>

        {/* Profile Information Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-4">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-5 text-white">
            <div className="flex items-center">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl font-bold">
                {user.prenom?.charAt(0)}{user.nom?.charAt(0)}
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-bold">{user.prenom} {user.nom}</h2>
                <p className="text-sm text-blue-100">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center">
                  <User className="w-3 h-3 mr-1" />
                  Matricule
                </label>
                <p className="text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded">
                  {user.matricule}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center">
                  <Shield className="w-3 h-3 mr-1" />
                  Rôle
                </label>
                <div className="bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded">
                  {getRoleBadge(user.role)}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Nom
                </label>
                <p className="text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded">
                  {user.nom}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Prénom
                </label>
                <p className="text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded">
                  {user.prenom}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center">
                  <Mail className="w-3 h-3 mr-1" />
                  Email
                </label>
                <p className="text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded break-all">
                  {user.email}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  Date de naissance
                </label>
                <p className="text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded">
                  {new Date(user.date_naissance).toLocaleDateString('fr-FR', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-red-200 dark:border-red-800 p-4">
          <h3 className="text-base font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center">
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </h3>
          <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Se déconnecter</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Vous serez redirigé vers la page de connexion
              </p>
            </div>
            <Button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
