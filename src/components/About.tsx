'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface AboutProps {
  onClose: () => void;
}

const About: React.FC<AboutProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const [acknowledged, setAcknowledged] = useState(false);

  const handleClose = () => {
    if (!acknowledged) {
      alert(t('about.alertMessage'));
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              {t('about.title')}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* App Info */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {t('about.appInfoTitle')}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t('about.appDescription')}
              </p>
            </section>

            {/* Disclaimers */}
            <section>
              <div className="space-y-3">
                <p className="text-gray-600">
                  {t('about.disclaimer1')}
                </p>
                <p className="text-gray-600">
                  {t('about.disclaimer2')}
                </p>
              </div>
            </section>

            {/* Liability */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {t('about.liabilityTitle')}
              </h3>
              <div className="space-y-3 text-gray-600 leading-relaxed">
                <p>{t('about.liability1')}</p>
                <p>{t('about.liability2')}</p>
                <p>{t('about.liability3')}</p>
              </div>
            </section>

            {/* Acknowledgment */}
            <section className="pt-4 border-t">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="acknowledgment"
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label 
                  htmlFor="acknowledgment" 
                  className="text-gray-600 cursor-pointer"
                >
                  {t('about.acknowledgment')}
                </label>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="flex justify-end mt-8 pt-4 border-t">
            <button
              onClick={handleClose}
              disabled={!acknowledged}
              className={`px-6 py-2 rounded-lg transition-colors ${
                acknowledged 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {t('about.closeButton')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;