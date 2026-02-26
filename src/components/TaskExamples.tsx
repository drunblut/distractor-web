'use client';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MdClose } from 'react-icons/md';

interface TaskExamplesProps {
  onClose: () => void;
}

export default function TaskExamples({ onClose }: TaskExamplesProps) {
  const { t } = useTranslation();
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);

  const taskItems = [
    {
      key: 'pie',
      image: '/images/kreis1.webp',
      imageAlt: 'Pie Task Example'
    },
    {
      key: 'chess', 
      image: '/images/schach1.webp',
      imageAlt: 'Chess Task Example'
    },
    {
      key: 'math',
      image: '/images/MathTask.webp', 
      imageAlt: 'Math Task Example'
    },
    {
      key: 'hand',
      image: '/images/Hand1.webp',
      imageAlt: 'Hand Task Example'
    },
    {
      key: 'face',
      image: '/images/Face1.webp',
      imageAlt: 'Face Task 1 Example'
    },
    {
      key: 'face2',
      image: '/images/Face2.webp',
      imageAlt: 'Face Task 2 Example'
    },
    {
      key: 'faden',
      image: '/images/Faden6.webp',
      imageAlt: 'Thread Task Example'
    }
  ];

  // Check if all images are loaded
  useEffect(() => {
    const totalImages = taskItems.length;
    const processedImages = loadedImages.size + imageErrors.size;
    
    if (processedImages >= totalImages) {
      setAllImagesLoaded(true);
    }
  }, [loadedImages.size, imageErrors.size, taskItems.length]);

  const handleImageLoad = (imagPath: string) => {
    setLoadedImages(prev => new Set(prev).add(imagPath));
  };

  const handleImageError = (imagPath: string) => {
    setImageErrors(prev => new Set(prev).add(imagPath));
  };

  // Don't render main content until all images are loaded
  if (!allImagesLoaded) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">{t('common.loading', 'Loading...')}</p>
          {/* Preload images invisibly */}
          <div className="absolute opacity-0 pointer-events-none">
            {taskItems.map((task) => (
              <img
                key={`preload-${task.key}`}
                src={task.image}
                alt={`Preload ${task.imageAlt}`}
                className="w-1 h-1"
                onLoad={() => handleImageLoad(task.image)}
                onError={() => handleImageError(task.image)}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {t('taskExamples.title')}
            </h2>
            <p className="text-gray-600 mt-1">
              {t('taskExamples.subtitle')}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {taskItems.map((task) => (
              <div 
                key={task.key}
                className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors group"
              >
                <div className="flex items-start space-x-4">
                  {/* Task Image */}
                  <div className="flex-shrink-0">
                    <div 
                      className="bg-gray-50 group-hover:bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden transition-colors"
                      style={{
                        width: '88px',
                        height: '88px',
                        touchAction: 'pinch-zoom'
                      }}
                    >
                      <img
                        src={task.image}
                        alt={task.imageAlt}
                        width={88}
                        height={88}
                        className="max-w-full max-h-full object-contain select-none"
                        style={{
                          touchAction: 'pinch-zoom',
                          transformOrigin: 'center',
                          transition: 'transform 0.2s ease-out'
                        }}
                        onLoad={() => handleImageLoad(task.image)}
                        onError={() => handleImageError(task.image)}
                      />
                    </div>
                  </div>
                  
                  {/* Task Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {t(`taskExamples.${task.key}.title`)}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {t(`taskExamples.${task.key}.description`)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Footer */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-blue-800 text-sm font-medium text-center">
              💡 {t('taskExamples.footer')}
            </p>
          </div>
          
          {/* Close Button */}
          <div className="pt-4">
            <button
              onClick={onClose}
              className="w-full py-3 px-4 rounded-lg font-medium transition-colors bg-blue-500 hover:bg-blue-600 text-white"
            >
              {t('about.closeButton')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}