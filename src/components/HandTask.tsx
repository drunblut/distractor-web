'use client';
import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { MdChevronRight } from 'react-icons/md';
import { GlobalContext } from '../context/GlobalContext';
import handCoords from '../constants/hand_coords.json';

interface HandTaskProps {
  onComplete?: () => void;
}

interface HandCoord {
  finger: number;
  x: number;
  y: number;
}

export default function HandTask({ onComplete }: HandTaskProps) {
  const contextValue = useContext(GlobalContext);
  const { setHandData } = contextValue || {};
  const { t } = useTranslation();

  // Safety check for context
  if (!contextValue) {
    console.error('[HandTask] GlobalContext is undefined');
    return null;
  }

  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedCoords, setSelectedCoords] = useState<HandCoord[]>([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Responsive image sizing
  const [imageSize, setImageSize] = useState(350);

  useEffect(() => {
    const updateSize = () => {
      if (typeof window !== 'undefined') {
        const screenWidth = window.innerWidth;
        const maxSize = Math.min(screenWidth * 0.8, 400);
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

  const initializeHandTask = () => {
    // Random selection logic from original
    const handSides = ['Links', 'Rechts'];
    const positions = ['innen', 'aussen'];
    const rotations = [0, 90, 180, 270];
    
    const side = handSides[getRandomInt(0, handSides.length - 1)];
    const pos = positions[getRandomInt(0, positions.length - 1)];
    const rot = rotations[getRandomInt(0, rotations.length - 1)];
    
    const imageKey = `${side}${pos}_${rot}.png`;
    
    // Check if the image key exists in handCoords
    const coordsForImage = handCoords[imageKey as keyof typeof handCoords];
    const validImageKey = coordsForImage ? imageKey : 'Rechtsinnen_270.png';
    
    // Set image key for coordinates lookup (keeps .png extension)
    // but convert to .webp for actual image loading
    const displayImage = validImageKey.replace('.png', '.webp');
    setSelectedImage(displayImage);

    const allCoords = handCoords[validImageKey as keyof typeof handCoords] || [];
    if (allCoords.length > 0) {
      const idx = getRandomInt(0, allCoords.length - 1);
      const coord = allCoords[idx];
      setSelectedCoords([coord]);

      // Save hand data to GlobalContext
      const hand = validImageKey.includes('Links') ? 'links' : 'rechts';
      console.log(`HandTask: Setting hand data - ${hand}, finger ${coord.finger}`);
      if (setHandData) {
        setHandData({ hand, finger: coord.finger });
      }
    } else {
      setSelectedCoords([]);
      if (setHandData) {
        setHandData({ hand: '', finger: 0 });
      }
    }
    
    setImageLoaded(true);
  };

  useEffect(() => {
    initializeHandTask();
  }, []);

  // Show loading indicator while initializing
  if (!imageLoaded || !selectedImage) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-8 bg-[#dfdfdfff]">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-base text-gray-600 text-center font-medium">
            Wird geladen...
          </p>
        </div>
      </div>
    );
  }

  const originalSize = 320; // Original coordinate system size
  const scale = imageSize / originalSize;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-8 bg-[#dfdfdfff]">
      <div className="bg-[#dfdfdfff] p-4 sm:p-8 max-w-lg w-full">
        <p className="text-base sm:text-lg font-semibold text-gray-800 text-center mb-4 sm:mb-6">
          {t('handTask.instruction')}
        </p>
        
        <div className="flex justify-center mb-6 sm:mb-8">
          <div 
            className="relative"
            style={{
              width: `${imageSize}px`,
              height: `${imageSize}px`,
            }}
          >
            {/* Hand Image */}
            <img
              src={`/images/${selectedImage}`}
              alt={`Hand ${selectedImage}`}
              className="w-full h-full object-contain"
            />

            {/* Red dot markers for fingers */}
            {selectedCoords.map((coord, idx) => (
              <div
                key={idx}
                className="absolute bg-red-500 border-2 border-gray-800 rounded-full"
                style={{
                  left: `${(coord.x / originalSize) * 100}%`,
                  top: `${(coord.y / originalSize) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  width: '16px',
                  height: '16px',
                }}
              />
            ))}
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