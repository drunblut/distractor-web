import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdCheck, MdClose } from 'react-icons/md';

interface LanguageSelectorProps {
  isVisible: boolean;
  onClose: () => void;
  onLanguageSelect: (language: string) => void;
}

interface Language {
  code: string;
  name: string;
  flag: string;
}

const LANGUAGES: Language[] = [
  { code: 'de', name: 'languages.de', flag: '🇩🇪' },
  { code: 'en', name: 'languages.en', flag: '🇬🇧' },
  { code: 'fr', name: 'languages.fr', flag: '🇫🇷' },
  { code: 'it', name: 'languages.it', flag: '🇮🇹' },
  { code: 'es', name: 'languages.es', flag: '🇪🇸' },
  { code: 'nl', name: 'languages.nl', flag: '🇳🇱' },
  { code: 'pt', name: 'languages.pt', flag: '🇵🇹' },
];

export default function LanguageSelector({
  isVisible,
  onClose,
  onLanguageSelect,
}: LanguageSelectorProps) {
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  const handleLanguageChange = (languageCode: string) => {
    setSelectedLanguage(languageCode);
  };

  const handleConfirm = () => {
    onLanguageSelect(selectedLanguage);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            {t('menu.language')}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <MdClose size={24} color="#666" />
          </button>
        </div>

        {/* Info Text */}
        <div className="p-4 border-b border-gray-200">
          <p className="text-sm text-gray-600">
            {t('languageSelection.info')}
          </p>
        </div>

        {/* Language List */}
        <div className="max-h-96 overflow-y-auto">
          {LANGUAGES.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                selectedLanguage === language.code ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{language.flag}</span>
                <span className="text-base text-gray-800">
                  {t(language.name)}
                </span>
              </div>
              {selectedLanguage === language.code && (
                <MdCheck size={20} color="#3b82f6" />
              )}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {t('common.ok')}
          </button>
        </div>
      </div>
    </div>
  );
}