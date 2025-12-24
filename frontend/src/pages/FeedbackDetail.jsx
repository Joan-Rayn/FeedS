import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { apiClient } from '../services/api';
import Layout from '../components/Layout';
import { 
  ArrowLeft, 
  Clock, 
  User, 
  Tag, 
  AlertCircle, 
  CheckCircle, 
  MessageSquare,
  Send,
  FileText,
  Calendar,
  Paperclip,
  Download,
  Edit,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const FeedbackDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const [feedback, setFeedback] = useState(null);
  const [responses, setResponses] = useState([]);
  const [newResponse, setNewResponse] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchFeedbackDetail();
    fetchResponses();
  }, [id]);

  const fetchFeedbackDetail = async () => {
    try {
      const response = await apiClient.get(`/feedbacks/${id}`);
      setFeedback(response.data);
      setEditedTitle(response.data.title);
      setEditedDescription(response.data.description);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResponses = async () => {
    try {
      const response = await apiClient.get(`/feedbacks/${id}/responses`);
      setResponses(response.data);
    } catch (error) {
      console.error('Error fetching responses:', error);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      const response = await apiClient.patch(`/feedbacks/${id}`, { status: newStatus });
      setFeedback(response.data);
      alert('Statut mis à jour avec succès');
    } catch (error) {
      console.error('Error updating status:', error);
      const errorMsg = error.response?.data?.detail || 'Erreur lors de la mise à jour du statut';
      alert(errorMsg);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedTitle(feedback.title);
    setEditedDescription(feedback.description);
  };

  const handleSaveEdit = async () => {
    if (!editedTitle.trim() || !editedDescription.trim()) {
      alert('Le titre et la description sont requis');
      return;
    }

    try {
      const response = await apiClient.patch(`/feedbacks/${id}`, {
        title: editedTitle,
        description: editedDescription
      });
      setFeedback(response.data);
      setIsEditing(false);
      alert('Feedback modifié avec succès');
    } catch (error) {
      console.error('Error updating feedback:', error);
      alert('Erreur lors de la modification du feedback');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await apiClient.delete(`/feedbacks/${id}`);
      alert('Feedback supprimé avec succès');
      navigate('/feedbacks');
    } catch (error) {
      console.error('Error deleting feedback:', error);
      alert('Erreur lors de la suppression du feedback');
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    if (!newResponse.trim()) return;

    setSubmitting(true);
    try {
      await apiClient.post(`/feedbacks/${id}/responses`, {
        content: newResponse
      });
      setNewResponse('');
      fetchResponses();
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Erreur lors de l\'envoi de la réponse');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      open: { label: 'Ouvert', color: 'bg-blue-100 text-blue-800' },
      in_progress: { label: 'En cours', color: 'bg-yellow-100 text-yellow-800' },
      resolved: { label: 'Résolu', color: 'bg-green-100 text-green-800' },
      closed: { label: 'Fermé', color: 'bg-gray-100 text-gray-800' }
    };
    const badge = badges[status] || badges.open;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: { label: 'Basse', color: 'bg-gray-100 text-gray-800' },
      medium: { label: 'Moyenne', color: 'bg-blue-100 text-blue-800' },
      high: { label: 'Haute', color: 'bg-red-100 text-red-800' }
    };
    const badge = badges[priority] || badges.medium;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Feedback introuvable</h3>
            <button
              onClick={() => navigate('/feedbacks')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Retour aux feedbacks
            </button>
          </div>
        </div>
      </div>
    );
  }

  const canRespond = user && (user.role === 'admin' || user.role === 'personnel');
  const canEdit = user && (user.id === feedback.user_id || user.role === 'admin');
  const canDelete = user && (user.id === feedback.user_id || user.role === 'admin' || user.role === 'personnel');

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/feedbacks')}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Retour aux feedbacks
            </button>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {canEdit && !isEditing && (
                <button
                  onClick={handleEdit}
                  className="flex items-center px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Modifier
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
              
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full text-xl font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2"
                    placeholder="Titre du feedback"
                  />
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSaveEdit}
                      className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    >
                      Enregistrer
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 text-sm bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {feedback.title}
                  </h1>
                  <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center">
                      <Calendar className="mr-1 h-4 w-4" />
                      {format(new Date(feedback.created_at), 'PPP', { locale: fr })}
                    </span>
                    <span className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      {format(new Date(feedback.created_at), 'HH:mm')}
                    </span>
                  </div>
                </>
              )}
            </div>
            <div className="flex flex-col space-y-2">
              {getStatusBadge(feedback.status)}
              {getPriorityBadge(feedback.priority)}
            </div>
          </div>

          {/* User Info */}
          {feedback.user && (
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                  {feedback.user.prenom[0]}{feedback.user.nom[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Créé par: {feedback.user.prenom} {feedback.user.nom}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {feedback.user.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</h3>
            {isEditing ? (
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                rows={6}
                className="w-full text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2"
                placeholder="Description du feedback"
              />
            ) : (
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{feedback.description}</p>
            )}
          </div>

          {/* Attachments */}
          {feedback.attachments && feedback.attachments.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                <Paperclip className="mr-2 h-4 w-4" />
                Pièces jointes ({feedback.attachments.length})
              </h3>
              <div className="space-y-2">
                {feedback.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{attachment.filename}</span>
                    </div>
                    <a
                      href={attachment.filepath}
                      download={attachment.filename}
                      className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Télécharger
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Change Section */}
          {canRespond && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <label htmlFor="status-select" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Changer le statut
              </label>
              <select
                id="status-select"
                value={feedback.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updatingStatus}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="open">Ouvert</option>
                <option value="in_progress">En cours</option>
                <option value="resolved">Résolu</option>
                <option value="closed">Fermé</option>
              </select>
            </div>
          )}
        </div>

        {/* Responses Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" />
            Réponses ({responses.length})
          </h2>

          <div className="space-y-4">
            {responses.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Aucune réponse pour le moment
              </p>
            ) : (
              responses.map((response) => (
                <div key={response.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {response.user?.prenom} {response.user?.nom}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(response.created_at), 'PPP à HH:mm', { locale: fr })}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{response.content}</p>
                </div>
              ))
            )}
          </div>

          {/* Response Form */}
          {canRespond && (
            <form onSubmit={handleSubmitResponse} className="mt-6">
              <label htmlFor="response" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ajouter une réponse
              </label>
              <textarea
                id="response"
                rows={4}
                value={newResponse}
                onChange={(e) => setNewResponse(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Écrivez votre réponse..."
                disabled={submitting}
              />
              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || !newResponse.trim()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {submitting ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirmer la suppression
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Êtes-vous sûr de vouloir supprimer ce feedback ? Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 text-sm bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
              >
                {deleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default FeedbackDetail;