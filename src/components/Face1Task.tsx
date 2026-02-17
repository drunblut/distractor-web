'use client';
import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { MdChevronRight } from 'react-icons/md';
import { GlobalContext } from '../context/GlobalContext';import OptimizedImage from './OptimizedImage';
interface Face1TaskProps {
  onComplete?: () => void;
}

export default function Face1Task({ onComplete }: Face1TaskProps) {
  const contextValue = useContext(GlobalContext);
  const { face1Level, setFace1Data } = contextValue || {};
  const { t } = useTranslation();

  // Safety check for context
  if (!contextValue) {
    console.error('[Face1Task] GlobalContext is undefined');
    return null;
  }

  const [targetFace, setTargetFace] = useState<number>(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Responsive image sizing
  const [imageSize, setImageSize] = useState(350);

  useEffect(() => {
    const updateSize = () => {
      if (typeof window !== 'undefined') {
        const screenWidth = window.innerWidth;
        // Auf Handys (< 768px) nur 70% der Bildschirmbreite verwenden
        const isMobile = screenWidth < 768;
        const widthPercentage = isMobile ? 0.7 : 0.8;
        const maxSize = Math.min(screenWidth * widthPercentage, 400);
        setImageSize(Math.max(maxSize, 280));
      }
    };

    updateSize();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateSize);
      return () => window.removeEventListener('resize', updateSize);
    }
  }, []);

  const getRandomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const initializeFace1Task = () => {
    // Select a random face number from all available faces (1-69)
    // Level difficulty is determined by number of choices in recall, not face selection
    const faceNumber = getRandomInt(1, 69);
    
    setTargetFace(faceNumber);
    
    // Save face data to GlobalContext
    const currentLevel = face1Level || 1;
    console.log(`Face1Task Level ${currentLevel}: Setting target face - ${faceNumber}`);
    if (setFace1Data) {
      setFace1Data({ targetFace: faceNumber });
    }
    
    setImageLoaded(true);
  };

  useEffect(() => {
    initializeFace1Task();
  }, []);

  const handleImageLoad = () => {
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  // Show loading indicator while initializing
  if (!imageLoaded) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-8 bg-[#dfdfdfff]">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-base text-gray-600 text-center font-medium">
            {t('common.loading')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-8 bg-[#dfdfdfff]">
      <div className="bg-[#dfdfdfff] p-4 sm:p-8 max-w-lg w-full">
        <p className="text-base sm:text-lg font-semibold text-gray-800 text-center mb-4 sm:mb-6">
          {t('face1Task.instruction')} (Level {face1Level || 1})
        </p>
        
        <div className="flex justify-center mb-6 sm:mb-8">
          <div 
            className="relative border-2 border-gray-300 rounded-lg overflow-hidden bg-white"
            style={{
              width: `${imageSize}px`,
              height: `${imageSize}px`,
            }}
          >
            {imageError ? (
              // Fallback placeholder if image is missing
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <div className="text-6xl text-gray-400 mb-2">👤</div>
                  <p className="text-lg font-semibold text-gray-600">Face {targetFace}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Image not found. Please check Bild{targetFace}.png in /public/images/
                  </p>
                </div>
              </div>
            ) : (
              <OptimizedImage
                faceNumber={targetFace}
                alt={`Face ${targetFace}`}
                className="w-full h-full object-contain"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            )}
          </div>
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={() => onComplete && onComplete()}
            className="p-4 rounded-full transition-all duration-200 text-gray-600 hover:text-gray-800 hover:bg-gray-100 transform hover:scale-110"
          >
            <MdChevronRight size={72} />
          </button>
        </div>
      </div>
    </div>
  );
}