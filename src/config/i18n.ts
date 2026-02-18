import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import language files
import de from '../../public/locales/de.json';
import en from '../../public/locales/en.json';
import es from '../../public/locales/es.json';
import fr from '../../public/locales/fr.json';
import it from '../../public/locales/it.json';
import nl from '../../public/locales/nl.json';
import pt from '../../public/locales/pt.json';

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
      es: { translation: es },
      fr: { translation: fr },
      it: { translation: it },
      nl: { translation: nl },
      pt: { translation: pt },
    },
  });

export default i18n;