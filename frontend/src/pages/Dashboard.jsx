import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchFeedbacks } from '../store/slices/feedbackSlice';
import Layout from '../components/Layout';
import { FeedbackStatusChart, FeedbackTrendChart, CategoryChart } from '../components/charts/AnalyticsCharts';
import { MessageSquare, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { feedbacks, loading } = useSelector(state => state.feedback);
  const [stats, setStats] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({
    statusData: { open: 0, inProgress: 0, resolved: 0, closed: 0 },
    trendData: { labels: [], created: [], resolved: [] },
    categoryData: []
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      dispatch(fetchFeedbacks());
      fetchStats();
    }
  }, [isAuthenticated, dispatch, navigate]);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/v1/metrics/stats');
      setStats(response.data);

      // Prepare analytics data
      const statusCounts = {
        open: response.data.open_feedbacks || 0,
        inProgress: feedbacks.filter(f => f.status === 'in_progress').length,
        resolved: response.data.resolved_feedbacks || 0,
        closed: feedbacks.filter(f => f.status === 'closed').length
      };

      setAnalyticsData({
        statusData: statusCounts,
        trendData: {
          labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
          created: [12, 19, 3, 5, 2, 3],
          resolved: [2, 3, 20, 5, 1, 4]
        },
        categoryData: [
          { name: 'Technique', count: 15 },
          { name: 'Pédagogique', count: 8 },
          { name: 'Administratif', count: 12 },
          { name: 'Autre', count: 5 }
        ]
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const userFeedbacks = feedbacks.filter(f => f.user_id === user?.id || user?.role === 'admin' || user?.role === 'personnel');

  const getStatusColor = (status) => {
    const colors = {
      'open': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      'in_progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      'resolved': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      'closed': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
    };
    return colors[status] || colors['open'];
  };

  const getStatusLabel = (status) => {
    const labels = {
      'open': 'Ouvert',
      'in_progress': 'En cours',
      'resolved': 'Résolu',
      'closed': 'Fermé'
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'high': 'text-red-600 dark:text-red-400',
      'medium': 'text-orange-600 dark:text-orange-400',
      'low': 'text-green-600 dark:text-green-400'
    };
    return colors[priority] || colors['low'];
  };

  return (
    <Layout>
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Bonjour, {user?.prenom} 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Bienvenue sur votre tableau de bord FeedS
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.total_feedbacks || 0}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En attente</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.open_feedbacks || 0}</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Résolus</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.resolution_rate || 0}%</p>
            </div>
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Utilisateurs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.total_users || 0}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
              <AlertCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        {/* Charts Row */}
        {user?.role === 'admin' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Statut</h3>
              <div className="h-48">
                <FeedbackStatusChart data={analyticsData.statusData} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Évolution</h3>
              <div className="h-48">
                <FeedbackTrendChart data={analyticsData.trendData} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Par catégorie</h3>
              <div className="h-48">
                <CategoryChart data={analyticsData.categoryData} />
              </div>
            </div>
          </div>
        )}

        {/* Feedbacks List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {user?.role === 'student' ? 'Mes feedbacks' : 'Feedbacks récents'}
            </h2>
            <button
              onClick={() => navigate('/feedbacks')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              Voir tout
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : userFeedbacks.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Aucun feedback</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userFeedbacks.slice(0, 6).map(feedback => (
                <div
                  key={feedback.id}
                  onClick={() => navigate(`/feedback/${feedback.id}`)}
                  className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">
                      {feedback.title}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(feedback.status)}`}>
                      {getStatusLabel(feedback.status)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                    {feedback.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span className={getPriorityColor(feedback.priority)}>
                      {feedback.priority === 'high' ? '🔴 Haute' : feedback.priority === 'medium' ? '🟡 Moyenne' : '🟢 Basse'}
                    </span>
                    <span>{new Date(feedback.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
