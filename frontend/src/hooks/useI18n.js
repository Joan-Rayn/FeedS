import { useTranslation } from 'react-i18next';

export const useI18n = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const currentLanguage = i18n.language;

  return {
    t,
    changeLanguage,
    currentLanguage,
    languages: ['fr', 'en'],
    languageNames: {
      fr: 'Français',
      en: 'English'
    }
  };
};