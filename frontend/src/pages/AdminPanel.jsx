import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchUsers } from '../store/slices/userSlice';
import { fetchFeedbacks } from '../store/slices/feedbackSlice';
import Layout from '../components/Layout';
import { Users, MessageSquare, TrendingUp, Shield, ArrowRight, Activity } from 'lucide-react';

const AdminPanel = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { users, loading: usersLoading } = useSelector(state => state.user);
  const { feedbacks, loading: feedbacksLoading } = useSelector(state => state.feedback);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/dashboard');
    } else {
      dispatch(fetchUsers());
      dispatch(fetchFeedbacks());
    }
  }, [isAuthenticated, user, dispatch, navigate]);

  const stats = {
    totalUsers: users.length,
    students: users.filter(u => u.role === 'etudiant').length,
    staff: users.filter(u => u.role === 'personnel').length,
    admins: users.filter(u => u.role === 'admin').length,
    totalFeedbacks: feedbacks.length,
    openFeedbacks: feedbacks.filter(f => f.status === 'open').length,
    resolvedFeedbacks: feedbacks.filter(f => f.status === 'resolved').length,
  };

  const StatCard = ({ icon: Icon, label, value, color, bgColor, onClick }) => (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${onClick ? 'cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{label}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`p-4 rounded-full ${bgColor}`}>
          <Icon className={`w-8 h-8 ${color}`} />
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
            <Shield className="w-8 h-8 mr-3 text-purple-600 dark:text-purple-400" />
            Panneau d'administration
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Vue d'ensemble et gestion de la plateforme FeedS
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                  icon={Users}
                  label="Total utilisateurs"
                  value={stats.totalUsers}
                  color="text-blue-600 dark:text-blue-400"
                  bgColor="bg-blue-100 dark:bg-blue-900/30"
                  onClick={() => navigate('/admin/users')}
                />
                <StatCard
                  icon={Users}
                  label="Étudiants"
                  value={stats.students}
                  color="text-green-600 dark:text-green-400"
                  bgColor="bg-green-100 dark:bg-green-900/30"
                />
                <StatCard
                  icon={Shield}
                  label="Personnel"
                  value={stats.staff}
                  color="text-orange-600 dark:text-orange-400"
                  bgColor="bg-orange-100 dark:bg-orange-900/30"
                />
                <StatCard
                  icon={Shield}
                  label="Administrateurs"
                  value={stats.admins}
                  color="text-purple-600 dark:text-purple-400"
                  bgColor="bg-purple-100 dark:bg-purple-900/30"
                />
              </div>

              {/* Feedback Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                  icon={MessageSquare}
                  label="Total feedbacks"
                  value={stats.totalFeedbacks}
                  color="text-indigo-600 dark:text-indigo-400"
                  bgColor="bg-indigo-100 dark:bg-indigo-900/30"
                  onClick={() => navigate('/feedbacks')}
                />
                <StatCard
                  icon={Activity}
                  label="Feedbacks ouverts"
                  value={stats.openFeedbacks}
                  color="text-red-600 dark:text-red-400"
                  bgColor="bg-red-100 dark:bg-red-900/30"
                />
                <StatCard
                  icon={TrendingUp}
                  label="Feedbacks résolus"
                  value={stats.resolvedFeedbacks}
                  color="text-green-600 dark:text-green-400"
                  bgColor="bg-green-100 dark:bg-green-900/30"
                />
              </div>

        {/* Quick Actions & Recent Users */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
              Actions rapides
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/admin/users')}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-900/30 dark:hover:to-blue-800/30 rounded-lg transition-all duration-200 group"
              >
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                  <span className="font-medium text-gray-900 dark:text-white">Gérer les utilisateurs</span>
                </div>
                <ArrowRight className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/feedbacks')}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 hover:from-green-100 hover:to-green-200 dark:hover:from-green-900/30 dark:hover:to-green-800/30 rounded-lg transition-all duration-200 group"
              >
                <div className="flex items-center">
                  <MessageSquare className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
                  <span className="font-medium text-gray-900 dark:text-white">Gérer tous les feedbacks</span>
                </div>
                <ArrowRight className="w-5 h-5 text-green-600 dark:text-green-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                      <Users className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                      Utilisateurs récents
                    </h3>
                    {usersLoading ? (
                      <div className="flex justify-center items-center py-8">
                        <svg className="animate-spin h-8 w-8 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {users.slice(0, 5).map(u => (
                          <div 
                            key={u.id} 
                            className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold mr-3">
                                {u.prenom?.charAt(0)}{u.nom?.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{u.nom} {u.prenom}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{u.matricule}</p>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              u.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                              u.role === 'personnel' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                              'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            }`}>
                              {u.role === 'admin' ? 'Admin' : u.role === 'personnel' ? 'Personnel' : 'Étudiant'}
                            </span>
                          </div>
                        ))}
                        {users.length > 5 && (
                          <button
                            onClick={() => navigate('/admin/users')}
                            className="w-full text-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium py-2"
                          >
                            Voir tous les utilisateurs ({users.length})
                          </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminPanel;
