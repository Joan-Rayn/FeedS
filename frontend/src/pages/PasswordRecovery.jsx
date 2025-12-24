import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

const PasswordRecovery = () => {
  const [matricule, setMatricule] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    setNewPassword('');
    try {
      const response = await axios.post('http://localhost:8000/api/v1/auth/reset-password', { matricule });
      setNewPassword(response.data.new_password);
      setMessage('Mot de passe réinitialisé avec succès!');
      setShowPassword(false);  // Cacher par défaut
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la réinitialisation');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black bg-opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="relative z-10 max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 transform transition-all duration-300 hover:scale-105">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Récupération du mot de passe
            </h2>
            <p className="text-gray-600 text-sm">
              Entrez votre matricule pour recevoir un nouveau mot de passe
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="matricule" className="block text-sm font-medium text-gray-700 mb-2">
                Matricule
              </label>
              <input
                id="matricule"
                type="text"
                required
                value={matricule}
                onChange={(e) => setMatricule(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                placeholder="Votre matricule "
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                <p className="font-semibold mb-2">{message}</p>
                {newPassword && (
                  <div className="mt-3 p-3 bg-white rounded-lg border border-green-300">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Votre nouveau mot de passe:
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        readOnly
                        className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg bg-gray-50 font-mono text-lg font-semibold text-gray-900"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      💡 Copiez ce mot de passe et connectez-vous avec votre matricule.
                    </p>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Récupération...
                </div>
              ) : 'Récuperer le mot de passe'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-purple-600 hover:text-purple-800 text-sm font-medium transition duration-200"
            >
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordRecovery;
