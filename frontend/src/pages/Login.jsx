import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { login, clearError, getCurrentUser } from '../store/slices/authSlice';
import { Eye, EyeOff } from 'lucide-react';
import Toast from '../components/Toast';

const Login = () => {
  const [formData, setFormData] = useState({
    matricule: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(state => state.auth);

  useEffect(() => {
    if (error) {
      setShowToast(true);
    }
  }, [error]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(login(formData));
    if (result.meta.requestStatus === 'fulfilled') {
      await dispatch(getCurrentUser());
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black bg-opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="relative z-10 max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 transform transition-all duration-300 hover:scale-105">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Bienvenue sur FeedS
            </h2>
            <p className="text-gray-600 text-sm">
              Plateforme de gestion des retours étudiants de l'ENSPD
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="matricule" className="block text-sm font-medium text-gray-700 mb-2">
                Matricule
              </label>
              <input
                id="matricule"
                name="matricule"
                type="text"
                required
                value={formData.matricule}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Entrez votre matricule"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Entrez votre mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition duration-200"
                  style={{ top: '50%' }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connexion...
                </div>
              ) : 'Se connecter'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <Link
              to="/register"
              className="block text-blue-600 hover:text-blue-800 text-sm font-medium transition duration-200"
            >
              Créer un nouveau compte
            </Link>
            <Link
              to="/password-recovery"
              className="block text-gray-500 hover:text-gray-700 text-sm transition duration-200"
            >
              Mot de passe oublié ?
            </Link>
          </div>
        </div>
        {showToast && error && (
          <Toast
            message={error?.detail || 'Erreur inconnue'}
            type="error"
            onClose={() => {
              setShowToast(false);
              dispatch(clearError());
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Login;
