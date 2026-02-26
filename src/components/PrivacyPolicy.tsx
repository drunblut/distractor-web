'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

interface PrivacyPolicyProps {
  onClose: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onClose }) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6 border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              {t('menu.privacy')}
            </h2>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Section 1 */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {t('privacyPolicy.section1.title')}
              </h3>
              <p className="text-gray-600 mb-3">
                {t('privacyPolicy.section1.content')}
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li>{t('privacyPolicy.section1.list.mood')}</li>
                <li>{t('privacyPolicy.section1.list.symptoms')}</li>
                <li>{t('privacyPolicy.section1.list.scores')}</li>
                <li>{t('privacyPolicy.section1.list.usage')}</li>
                <li>{t('privacyPolicy.section1.list.sessionId')}</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {t('privacyPolicy.section2.title')}
              </h3>
              <p className="text-gray-600">
                {t('privacyPolicy.section2.content')}
              </p>
            </section>

            {/* Section 3 */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {t('privacyPolicy.section3.title')}
              </h3>
              <p className="text-gray-600">
                {t('privacyPolicy.section3.content')}
              </p>
            </section>

            {/* Section 4 */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {t('privacyPolicy.section4.title')}
              </h3>
              <p className="text-gray-600">
                {t('privacyPolicy.section4.content')}
              </p>
            </section>

            {/* Section 5 */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {t('privacyPolicy.section5.title')}
              </h3>
              <p className="text-gray-600">
                {t('privacyPolicy.section5.content')}
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {t('privacyPolicy.section6.title')}
              </h3>
              <div className="text-gray-600 space-y-2">
                <p>
                  {t('privacyPolicy.section6.content.pre')} {' '}
                  <a 
                    href="mailto:aepplerlandapps@gmail.com" 
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    aepplerlandapps@gmail.com
                  </a>
                </p>
                <p>
                  {t('privacyPolicy.section6.content.mid')} {' '}
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

export default PrivacyPolicy;