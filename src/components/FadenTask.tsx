'use client';
import React, { useState, useEffect, useRef, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { GlobalContext } from '../context/GlobalContext';
import fadenCoords from '../constants/faden_coords.json';

interface FadenTaskProps {
  onComplete?: () => void;
}

interface Marker {
  feld: number;
  x: number;
  y: number;
  symbol: string;
}

export default function FadenTask({ onComplete }: FadenTaskProps) {
  const contextValue = useContext(GlobalContext);
  const { addPoints, trackTaskAttempt, reduceMathLevelOnError, navigateToNextTask, fadenLevel } = contextValue || {};
  const { t } = useTranslation();

  // Safety check for context
  if (!contextValue) {
    console.error('[FadenTask] GlobalContext is undefined');
    return null;
  }

  const [currentFaden, setCurrentFaden] = useState(1);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [coordinates, setCoordinates] = useState<Array<{feld: number; x: number; y: number}>>([]);
  const [markers, setMarkers] = useState<Marker[]>([]);
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

  // Available rotations
  const rotations = [0, 90, 180, 270];

  // Marker symbols
  const symbols = ['X', '2', '3', '4'];

  const handleMarkerClick = (markerSymbol: string) => {
    validateAnswer(markerSymbol);
  };

  const validateAnswer = (inputDigit: string) => {
    if (!addPoints || !trackTaskAttempt || !reduceMathLevelOnError) {
      console.error('Missing context functions');
      return;
    }

    // Find the position of X in the markers
    const xPosition = markers.findIndex(marker => marker.symbol === 'X');
    if (xPosition === -1) {
      console.error('X marker not found');
      return;
    }

    let isCorrect = false;
    let expectedDigit = '';

    // Check answer based on X position and corresponding field
    if (xPosition === 0) { // X is at field 1 (index 0)
      expectedDigit = markers[1]?.symbol; // Check field 2 (index 1)
      isCorrect = inputDigit === expectedDigit;
    } else if (xPosition === 1) { // X is at field 2 (index 1)
      expectedDigit = markers[0]?.symbol; // Check field 1 (index 0)
      isCorrect = inputDigit === expectedDigit;
    } else if (xPosition === 2) { // X is at field 3 (index 2)
      expectedDigit = markers[3]?.symbol; // Check field 4 (index 3)
      isCorrect = inputDigit === expectedDigit;
    } else if (xPosition === 3) { // X is at field 4 (index 3)
      expectedDigit = markers[2]?.symbol; // Check field 3 (index 2)
      isCorrect = inputDigit === expectedDigit;
    }

    if (isCorrect) {
      console.log('[FadenTask] Task completed correctly, calling addPoints...');
      addPoints('fadenTask', true, fadenLevel || 1);
      console.log('[FadenTask] Points awarded');
    } else {
      console.log('[FadenTask] Task completed incorrectly, tracking false attempt...');
      trackTaskAttempt('fadenTask', false);
      reduceMathLevelOnError(); // Reduce MathLevel on error
    }

    // Navigate to next task (FadenTask is special case - skips MathTask)
    setTimeout(() => {
      navigateToNextTask && navigateToNextTask();
    }, 500);
  };

  const initializeFadenTask = () => {
    // Random faden selection (1-5) and random rotation
    const fadenNumber = Math.floor(Math.random() * 5) + 1;
    const rotation = rotations[Math.floor(Math.random() * rotations.length)];
    setCurrentFaden(fadenNumber);
    setCurrentRotation(rotation);

    // Load coordinates for the selected faden and rotation
    const coordKey = `Faden${fadenNumber}_${rotation}` as keyof typeof fadenCoords;
    const coords = fadenCoords[coordKey] || [];
    setCoordinates(coords);

    // Generate random markers for the 4 coordinates
    const shuffledSymbols = [...symbols].sort(() => Math.random() - 0.5);
    const newMarkers: Marker[] = coords.map((coord, index) => ({
      ...coord,
      symbol: shuffledSymbols[index]
    }));
    setMarkers(newMarkers);

    setImageLoaded(true);
  };

  useEffect(() => {
    // Only initialize if we don't have coordinates yet
    if (coordinates.length === 0) {
      initializeFadenTask();
    }
  }, [coordinates]);

  // Show loading indicator while initializing
  if (!imageLoaded || markers.length === 0) {
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

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-8 bg-[#dfdfdfff]">
      <div className="bg-[#dfdfdfff] p-4 sm:p-8 max-w-lg w-full">
        <p className="text-base sm:text-lg font-semibold text-gray-800 text-center mb-4 sm:mb-6">
          {t('fadenTask.instruction')}
        </p>
        
        <div className="flex justify-center mb-6 sm:mb-8">
          <div 
            className="relative"
            style={{
              width: `${imageSize}px`,
              height: `${imageSize}px`,
            }}
          >
            {/* Faden Image */}
            <img
              src={`/images/Faden${currentFaden}.webp`}
              alt={`Faden ${currentFaden}`}
              className="w-full h-full object-contain"
              style={{
                transform: `rotate(${currentRotation}deg)`,
              }}
            />

            {/* Coordinate Markers */}
            {markers.map((marker, index) => (
              <div
                key={index}
                className="absolute flex items-center justify-center bg-white border-2 border-gray-800 rounded shadow-lg cursor-pointer hover:bg-gray-100 transition-colors z-10"
                style={{
                  left: `${(marker.x / 350) * 100}%`,
                  top: `${(marker.y / 350) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  width: '30px',
                  height: '30px',
                }}
                onClick={() => handleMarkerClick(marker.symbol)}
              >
                <span className="text-sm font-bold text-gray-800">
                  {marker.symbol}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            Klicken Sie auf den Punkt, der dem X-Punkt gegenüber liegt.
          </p>
        </div>
      </div>
    </div>
  );
}