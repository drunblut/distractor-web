import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import language files (we'll copy them next)
import de from '../../public/locales/de.json';
import en from '../../public/locales/en.json';

i18n
  .use(initReactI18next)
  .init({
    debug: false,
    lng: 'de', // Deutsch als Standardsprache
    fallbackLng: 'de', // Fallback auf Deutsch
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    resources: {
      de: { translation: de },
      en: { translation: en },
    },
  });

export default i18n;