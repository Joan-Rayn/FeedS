import { Link, useRouteError } from 'react-router-dom';
import { AlertTriangle, Home, RefreshCw, Mail } from 'lucide-react';

const ServerError = () => {
  const error = useRouteError();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white dark:bg-gray-800 py-12 px-6 shadow-xl rounded-2xl border border-red-200 dark:border-red-900/50">
          <div className="text-center">
            {/* Error Icon */}
            <div className="mb-8">
              <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 animate-pulse">
                <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
              </div>
            </div>

            {/* Message */}
            <div className="mb-10">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Erreur serveur</h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                Une erreur inattendue s'est produite.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Nos équipes ont été automatiquement notifiées et travaillent sur une solution.
              </p>
            </div>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && error && (
              <details className="text-left bg-red-50 dark:bg-red-900/20 p-4 rounded-xl mb-8 border border-red-200 dark:border-red-800">
                <summary className="cursor-pointer text-sm font-semibold text-red-700 dark:text-red-400 mb-2">
                  📋 Détails de l'erreur (mode développement)
                </summary>
                <pre className="mt-3 text-xs text-red-600 dark:text-red-400 whitespace-pre-wrap overflow-x-auto p-3 bg-white dark:bg-gray-900 rounded-lg">
                  {error.message || 'Erreur inconnue'}
                </pre>
              </details>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center space-x-2 py-3 px-6 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
              >
                <RefreshCw className="h-5 w-5" />
                <span>Recharger la page</span>
              </button>

              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center space-x-2 py-3 px-6 border-2 border-gray-300 dark:border-gray-600 rounded-xl shadow-sm text-base font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                <Home className="h-5 w-5" />
                <span>Retour au tableau de bord</span>
              </Link>
            </div>

            {/* Support Info */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <strong>Si le problème persiste :</strong>
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Mail className="h-4 w-4" />
                <span>Contactez le support technique</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Code erreur: 500 • {new Date().toLocaleTimeString('fr-FR')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ServerError;