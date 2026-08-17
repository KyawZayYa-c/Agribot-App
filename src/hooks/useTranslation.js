import { useLanguage } from '../contexts/LanguageContext';

export const useTranslation = () => {
  const { t, language, changeLanguage } = useLanguage();
  return { t, language, changeLanguage };
};