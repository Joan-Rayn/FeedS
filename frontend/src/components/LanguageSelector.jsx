import { Languages } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';

const LanguageSelector = () => {
  const { changeLanguage, currentLanguage, languages, languageNames } = useI18n();

  return (
    <div className="relative">
      <button
        onClick={() => {
          const nextLang = languages.find(lang => lang !== currentLanguage) || languages[0];
          changeLanguage(nextLang);
        }}
        className="flex items-center space-x-2 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition duration-200"
        aria-label="Changer de langue"
      >
        <Languages size={20} />
        <span className="text-sm font-medium uppercase">
          {currentLanguage}
        </span>
      </button>
    </div>
  );
};

export default LanguageSelector;