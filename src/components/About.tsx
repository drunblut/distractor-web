'use client';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdClose } from 'react-icons/md';

interface AboutProps {
  onClose: () => void;
}

export default function About({ onClose }: AboutProps) {
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
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">{t('about.title')}</h2>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MdClose size={24} className="text-gray-600" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* App Description */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">{t('about.appInfoTitle')}</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              {t('about.appDescription')}
            </p>
            <p className="text-gray-600 leading-relaxed mb-2">
              {t('about.disclaimer1')}
            </p>
            <p className="text-gray-600 leading-relaxed">
              {t('about.disclaimer2')}
            </p>
          </section>

          {/* Liability */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">{t('about.liabilityTitle')}</h3>
            <div className="text-gray-600 space-y-3">
              <p className="leading-relaxed">{t('about.liability1')}</p>
              <p className="leading-relaxed">{t('about.liability2')}</p>
              <p className="leading-relaxed">{t('about.liability3')}</p>
            </div>
          </section>

          {/* Impressum */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">{t('imprint.title')}</h3>
            <div className="text-gray-600 space-y-3">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">{t('imprint.responsible')}</h4>
                <p>
                  {t('imprint.name')}<br />
                  {t('imprint.address')}<br />
                  {t('imprint.email')}
                </p>
              </div>

              <div>
                <p className="leading-relaxed mb-3">
                  {t('imprint.legalBasis')}
                </p>
                <p className="leading-relaxed">
                  {t('imprint.additionalInfo')}
                  <a 
                    href={t('imprint.linkUrl')}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 underline"
                  >
                    {t('imprint.linkText')}
                  </a>
                </p>
              </div>
            </div>
          </section>

          {/* Acknowledgment Checkbox */}
          <section className="pt-4 border-t border-gray-200">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="acknowledgment"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="acknowledgment" className="text-sm text-gray-600 leading-relaxed cursor-pointer">
                {t('about.acknowledgment')}
              </label>
            </div>
          </section>

          {/* Close Button */}
          <div className="pt-4">
            <button
              onClick={handleClose}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                acknowledged 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white' 
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
}