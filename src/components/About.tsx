'use client';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdClose } from 'react-icons/md';

interface AboutProps {
  onClose: () => void;
}

export default function About({ onClose }: AboutProps) {
  const { t } = useTranslation();
  const [acknowledged, setAcknowledged] = useState(() => {
    // Check localStorage on initial load
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('aboutAcknowledged');
      return stored === 'true';
    }
    return false;
  });

  const handleAcknowledgmentChange = (checked: boolean) => {
    setAcknowledged(checked);
    // Save to localStorage whenever acknowledgment changes
    if (typeof window !== 'undefined') {
      localStorage.setItem('aboutAcknowledged', checked.toString());
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">{t('about.title')}</h2>
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

          {/* Acknowledgment Checkbox */}
          <section className="pt-4 border-t border-gray-200">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="acknowledgment"
                checked={acknowledged}
                onChange={(e) => handleAcknowledgmentChange(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="acknowledgment" className="text-sm text-gray-600 leading-relaxed cursor-pointer">
                {t('about.acknowledgment')}
              </label>
            </div>
          </section>

          {/* Close Button */}
          <div className="pt-4 flex justify-center">
            <button
              onClick={handleClose}
              className="py-3 px-8 rounded-lg font-medium transition-colors bg-blue-500 hover:bg-blue-600 text-white max-w-xs"
            >
              {t('about.closeButton')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}