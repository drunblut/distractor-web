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
          <div className="mb-6 border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              {t('menu.imprint')}
            </h2>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Responsible Person */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {t('imprint.responsible')}
              </h3>
              <div className="text-gray-600 space-y-2">
                <p>
                  <strong>{t('imprint.name')}</strong>
                </p>
                <div className="whitespace-pre-line">
                  {t('imprint.address')}
                </div>
                <p>
                  {t('imprint.email')}
                </p>
                <p>
                  {t('imprint.phone')}
                </p>
              </div>
            </section>

            {/* Legal Basis */}
            <section>
              <div className="text-gray-600">
                <p className="font-medium">
                  {t('imprint.legalBasis')}
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
                <p>
                  {t('imprint.disclaimer.content3')}
                </p>
              </div>
            </section>

            {/* Copyright */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {t('imprint.copyright.title')}
              </h3>
              <div className="text-gray-600 space-y-3">
                <p>
                  {t('imprint.copyright.content1')}
                </p>
                <p>
                  {t('imprint.copyright.content2')}
                </p>
              </div>
            </section>

            {/* Additional Information */}
            <section className="border-t pt-4">
              <div className="text-gray-600">
                <p>
                  {t('imprint.additionalInfo')} {' '}
                  <a 
                    href={t('imprint.linkUrl')} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    {t('imprint.linkText')}
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