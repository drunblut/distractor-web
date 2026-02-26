'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

interface ImprintProps {
  onClose: () => void;
}

const Imprint: React.FC<ImprintProps> = ({ onClose }) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              {t('menu.imprint')}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* App Information */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {t('imprint.appInfo.title')}
              </h3>
              <div className="text-gray-600 space-y-2">
                <p>
                  <strong>{t('imprint.appInfo.name')}:</strong> Distractor
                </p>
                <p>
                  <strong>{t('imprint.appInfo.version')}:</strong> 2026v001
                </p>
                <p className="text-sm italic">
                  {t('imprint.appInfo.type')}
                </p>
              </div>
            </section>

            {/* Responsible */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {t('imprint.responsible.title')}
              </h3>
              <div className="text-gray-600 space-y-2">
                <p>
                  <strong>Andreas Reimer</strong>
                </p>
                <p>
                  <strong>{t('imprint.responsible.email')}:</strong> {' '}
                  <a 
                    href="mailto:areimer0509@gmail.com" 
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    areimer0509@gmail.com
                  </a>
                </p>
                <p>
                  <strong>{t('imprint.responsible.website')}:</strong> {' '}
                  <a 
                    href="https://www.aepplerlandapps.de" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    www.aepplerlandapps.de
                  </a>
                </p>
              </div>
            </section>

            {/* Disclaimer */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {t('imprint.disclaimer.title')}
              </h3>
              <div className="text-gray-600 space-y-3">
                <p>
                  {t('imprint.disclaimer.content1')}
                </p>
                <p>
                  {t('imprint.disclaimer.content2')}
                </p>
              </div>
            </section>

            {/* Copyright */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {t('imprint.copyright.title')}
              </h3>
              <p className="text-gray-600">
                {t('imprint.copyright.content')}
              </p>
            </section>

            {/* Legal Basis */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {t('imprint.legalBasis.title')}
              </h3>
              <div className="text-gray-600 space-y-2">
                <p>
                  {t('imprint.legalBasis.content')}
                </p>
                <p>
                  {t('imprint.legalBasis.additionalInfo')} {' '}
                  <a 
                    href={t('imprint.legalBasis.linkUrl')} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    {t('imprint.legalBasis.linkText')}
                  </a>
                </p>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="flex justify-end mt-8 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('about.closeButton')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Imprint;