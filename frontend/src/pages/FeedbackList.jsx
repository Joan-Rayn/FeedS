import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchFeedbacks } from '../store/slices/feedbackSlice';
import Layout from '../components/Layout';
import FeedbackCard from '../components/FeedbackCard';
import { Skeleton } from '../components/design-system';
import {
  Filter,
  Search,
  Plus,
  Grid,
  List,
  SortAsc,
  SortDesc,
  FileText,
  AlertCircle
} from 'lucide-react';

const FeedbackList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { feedbacks, loading } = useSelector(state => state.feedback);

  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      dispatch(fetchFeedbacks());
    }
  }, [isAuthenticated, dispatch, navigate]);

  const userFeedbacks = feedbacks.filter(f => {
    if (user?.role === 'student') {
      return f.user_id === user.id;
    } else if (user?.role === 'staff') {
      return f.assigned_to === user.id;
    } else if (user?.role === 'admin') {
      return true;
    }
    return false;
  });

  // Filter and sort feedbacks
  const filteredFeedbacks = userFeedbacks
    .filter(feedback => {
      const matchesSearch = feedback.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           feedback.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || feedback.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'created_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'open': return 'Ouvert';
      case 'in_progress': return 'En cours';
      case 'resolved': return 'Résolu';
      case 'closed': return 'Fermé';
      default: return status;
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {user?.role === 'student' ? 'Mes feedbacks' : 'Tous les feedbacks'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {filteredFeedbacks.length} feedback{filteredFeedbacks.length !== 1 ? 's' : ''} trouvé{filteredFeedbacks.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Bouton Créer nouveau feedback */}
          <button
            onClick={() => navigate('/feedback/new')}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-[1.02] shadow-lg flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Créer nouveau feedback</span>
          </button>
        </div>

              {/* Filters and Search */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  {/* Search */}
                  <div className="flex-1 max-w-md">
                    <div className="relative">
                      <Search className="absolute left-3 -translate-y-1/2 text-gray-400 w-5 h-5" style={{ top: '50%' }} />
                      <input
                        type="text"
                        placeholder="Rechercher des feedbacks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      />
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="flex flex-wrap items-center space-x-4">
                    {/* Status Filter */}
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="open">Ouvert</option>
                      <option value="in_progress">En cours</option>
                      <option value="resolved">Résolu</option>
                      <option value="closed">Fermé</option>
                    </select>

                    {/* Sort */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    >
                      <option value="created_at">Date de création</option>
                      <option value="title">Titre</option>
                      <option value="status">Statut</option>
                    </select>

                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      {sortOrder === 'asc' ? <SortAsc className="w-5 h-5" /> : <SortDesc className="w-5 h-5" />}
                    </button>

                    {/* View Mode */}
                    <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'} transition-colors`}
                      >
                        <Grid className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'} transition-colors`}
                      >
                        <List className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feedbacks Grid/List */}
              {loading ? (
                <div className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
                }>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                      <div className="space-y-4">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <div className="flex justify-between">
                          <Skeleton className="h-6 w-20" />
                          <Skeleton className="h-6 w-16" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredFeedbacks.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                  <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Aucun feedback trouvé
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {searchTerm || statusFilter !== 'all'
                      ? 'Essayez de modifier vos filtres de recherche.'
                      : 'Vous n\'avez pas encore créé de feedback.'}
                  </p>
                  {user?.role === 'student' && (
                    <button
                      onClick={() => navigate('/feedback/new')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                      Créer votre premier feedback
                    </button>
                  )}
                </div>
              ) : (
                <div className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
                }>
                  {filteredFeedbacks.map(feedback => (
                    <FeedbackCard
                      key={feedback.id}
                      feedback={feedback}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              )}
      </div>
    </Layout>
  );
};

export default FeedbackList;
