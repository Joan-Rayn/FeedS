import { memo } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const ThemeToggle = memo(() => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      aria-label={`Basculer vers le mode ${isDark ? 'clair' : 'sombre'}`}
      aria-pressed={isDark}
    >
      {isDark ? (
        <Sun size={20} className="text-yellow-500" aria-hidden="true" />
      ) : (
        <Moon size={20} className="text-blue-600" aria-hidden="true" />
      )}
    </button>
  );
});

ThemeToggle.displayName = 'ThemeToggle';

export default ThemeToggle;