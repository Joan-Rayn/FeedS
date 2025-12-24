import { Link } from 'react-router-dom';
import { Home, ArrowLeft, AlertCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white dark:bg-gray-800 py-12 px-6 shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            {/* Animated 404 */}
            <div className="mb-8 relative">
              <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse">
                404
              </h1>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <AlertCircle className="w-24 h-24 text-gray-300 dark:text-gray-600 animate-bounce" />
              </div>
            </div>

            {/* Message */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Page non trouvée</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                Oups ! La page que vous recherchez semble introuvable.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Elle a peut-être été déplacée ou n'existe plus.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center space-x-2 py-3 px-6 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
              >
                <Home className="h-5 w-5" />
                <span>Retour au tableau de bord</span>
              </Link>

              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center justify-center space-x-2 py-3 px-6 border-2 border-gray-300 dark:border-gray-600 rounded-xl shadow-sm text-base font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Page précédente</span>
              </button>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Besoin d'aide ? <Link to="/" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">Contactez le support</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;