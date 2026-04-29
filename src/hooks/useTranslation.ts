import { useStore } from '../store/useStore';
import { translations, TranslationKey } from '../utils/translations';

export const useTranslation = () => {
  const language = useStore((state) => state.language);
  const setLanguage = useStore((state) => state.setLanguage);

  const t = (key: TranslationKey): string => {
    const langDict = translations[language] || translations['en'];
    return langDict[key] || translations['en'][key] || key;
  };

  return { t, language, setLanguage };
};
