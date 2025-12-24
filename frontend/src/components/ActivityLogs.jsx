import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Clock,
  User,
  FileText,
  Users,
  Shield,
  Search,
  Upload,
  LogIn,
  LogOut,
  Edit,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings
} from 'lucide-react';

const ActivityLogs = ({ limit = 10, showHeader = true }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    fetchLogs();
  }, [limit]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const endpoint = limit === 5 ? '/api/v1/activity-logs/recent' : '/api/v1/activity-logs';
      const params = limit !== 5 ? { limit } : {};
      const response = await axios.get(endpoint, { params });
      setLogs(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des logs');
      console.error('Failed to fetch activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (activityType) => {
    switch (activityType) {
      case 'login':
        return <LogIn className="w-4 h-4 text-green-500" />;
      case 'logout':
        return <LogOut className="w-4 h-4 text-gray-500" />;
      case 'feedback_created':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'feedback_updated':
        return <Edit className="w-4 h-4 text-orange-500" />;
      case 'feedback_assigned':
        return <Users className="w-4 h-4 text-purple-500" />;
      case 'feedback_resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'user_created':
        return <User className="w-4 h-4 text-blue-500" />;
      case 'user_updated':
        return <Edit className="w-4 h-4 text-orange-500" />;
      case 'user_deleted':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'password_changed':
        return <Shield className="w-4 h-4 text-yellow-500" />;
      case 'profile_updated':
        return <User className="w-4 h-4 text-blue-500" />;
      case 'search_performed':
        return <Search className="w-4 h-4 text-indigo-500" />;
      case 'file_uploaded':
        return <Upload className="w-4 h-4 text-green-500" />;
      case 'admin_action':
        return <Settings className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityColor = (activityType) => {
    switch (activityType) {
      case 'login':
      case 'feedback_resolved':
      case 'file_uploaded':
        return 'bg-green-50 border-green-200';
      case 'logout':
        return 'bg-gray-50 border-gray-200';
      case 'feedback_created':
      case 'user_created':
      case 'profile_updated':
        return 'bg-blue-50 border-blue-200';
      case 'feedback_updated':
      case 'user_updated':
        return 'bg-orange-50 border-orange-200';
      case 'feedback_assigned':
        return 'bg-purple-50 border-purple-200';
      case 'user_deleted':
      case 'admin_action':
        return 'bg-red-50 border-red-200';
      case 'password_changed':
        return 'bg-yellow-50 border-yellow-200';
      case 'search_performed':
        return 'bg-indigo-50 border-indigo-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {showHeader && (
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Activité récente</h3>
          </div>
        )}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {showHeader && (
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Activité récente</h3>
        )}
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {showHeader && (
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Activité récente</h3>
          <button
            onClick={fetchLogs}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Actualiser
          </button>
        </div>
      )}

      {logs.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucune activité récente</p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div
              key={log.id}
              className={`flex items-start space-x-3 p-3 rounded-lg border ${getActivityColor(log.activity_type)}`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getActivityIcon(log.activity_type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 font-medium">
                  {log.description}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-gray-500">
                    {log.user_name}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(log.created_at), {
                      addSuffix: true,
                      locale: fr
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;