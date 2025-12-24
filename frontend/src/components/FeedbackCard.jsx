import { memo } from 'react';
import { useNavigate } from 'react-router-dom';

const FeedbackCard = memo(({ feedback }) => {
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'open': return 'Ouvert';
      case 'in_progress': return 'En cours';
      case 'resolved': return 'Résolu';
      case 'closed': return 'Fermé';
      default: return status;
    }
  };

  return (
    <article
      onClick={() => navigate(`/feedbacks/${feedback.id}`)}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer"
      role="article"
      aria-labelledby={`feedback-title-${feedback.id}`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3
            id={`feedback-title-${feedback.id}`}
            className="text-base font-semibold text-gray-900 dark:text-white line-clamp-1 flex-1 mr-2"
          >
            {feedback.title}
          </h3>
          <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${getStatusColor(feedback.status)}`}>
            {getStatusLabel(feedback.status)}
          </span>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {feedback.description}
        </p>

        <time
          className="text-xs text-gray-500 dark:text-gray-500 block"
          dateTime={feedback.created_at}
        >
          {new Date(feedback.created_at).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </time>


      </div>
    </article>
  );
});

FeedbackCard.displayName = 'FeedbackCard';

export default FeedbackCard;
