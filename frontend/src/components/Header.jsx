import { useState, memo, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';
import {
  Menu,
  Bell,
  User,
  LogOut,
  Settings,
  Search,
  Moon,
  Sun,
  Globe
} from 'lucide-react';

const Header = memo(({ onMenuClick }) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('fr');
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleLogout = useCallback(() => {
    dispatch(logout());
    navigate('/login');
  }, [dispatch, navigate]);

  const toggleProfileMenu = useCallback(() => {
    setIsProfileMenuOpen(prev => !prev);
  }, []);

  const toggleTheme = useCallback(() => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleLanguage = useCallback(() => {
    const newLanguage = currentLanguage === 'fr' ? 'en' : 'fr';
    setCurrentLanguage(newLanguage);
    // Here you would integrate with i18next
    console.log('Language switched to:', newLanguage);
  }, [currentLanguage]);

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 h-16">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-full">
        {/* Left side - Menu button and search */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors md:hidden"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search bar - hidden on mobile */}
          <div className="hidden sm:flex items-center space-x-3 flex-1 max-w-md">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 -translate-y-1/2 text-gray-400" style={{ top: '50%' }} />
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-2">
          {/* Language toggle */}
          <button
            onClick={toggleLanguage}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Changer de langue"
          >
            <Globe className="w-5 h-5" />
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={isDarkMode ? "Mode clair" : "Mode sombre"}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <button className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative">
            <Bell className="w-5 h-5" />
            {/* Notification badge */}
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile menu */}
          <div className="relative">
            <button
              onClick={toggleProfileMenu}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-expanded={isProfileMenuOpen}
              aria-haspopup="true"
              aria-label="Menu utilisateur"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user?.prenom?.[0]}{user?.nom?.[0]}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.prenom} {user?.nom}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user?.role === 'etudiant' ? 'Étudiant' :
                   user?.role === 'personnel' ? 'Personnel' : 'Admin'}
                </p>
              </div>
            </button>

            {/* Profile dropdown */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.prenom} {user?.nom}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 capitalize mt-1">
                    {user?.role === 'etudiant' ? 'Étudiant' :
                     user?.role === 'personnel' ? 'Personnel' : 'Admin'}
                  </p>
                </div>

                <Link
                  to="/profile"
                  className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Mon profil
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Se déconnecter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay for mobile menu */}
      {isProfileMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileMenuOpen(false)}
        />
      )}
    </header>
  );
});

export default Header;