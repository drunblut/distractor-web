'use client';
import React, { useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GlobalContext } from '../context/GlobalContext';
import OptimizedImage from './OptimizedImage';
import ScreenLoader from './ScreenLoader';

interface Face1RecallProps {
  onComplete?: () => void;
}

export default function Face1Recall({ onComplete }: Face1RecallProps) {
  const contextValue = useContext(GlobalContext);
  const { 
    face1Data, 
    face1Level, 
    setFace1Level,
    face1Streak,
    setFace1Streak,
    addPoints, 
    trackTaskAttempt, 
    reduceMathLevelOnError, 
    navigateToNextTask 
  } = contextValue || {};
  const { t } = useTranslation();
  
  const [imageErrors, setImageErrors] = useState<{[key: number]: boolean}>({});
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [clickedFace, setClickedFace] = useState<number | null>(null);
  
  // Responsive sizing
  const [faceSize, setFaceSize] = useState(120);

  // Get target face from context (fallback to 1 if not available)
  const targetFace = face1Data?.targetFace || 1;
  
  // Generate choices including target and random distractors based on level
  const getChoices = () => {
    const currentLevel = face1Level || 1;
    const choices = [targetFace];
    
    // Level-basierte Anzahl der Gesamtbilder
    let totalChoices;
    switch (currentLevel) {
      case 1:
        totalChoices = 4; // Level 1: 4 Bilder total
        break;
      case 2:
        totalChoices = 6; // Level 2: 6 Bilder total
        break;
      case 3:
      default:
        totalChoices = 8; // Level 3: 8 Bilder total
        break;
    }
    
    // Generate random distractors from all available faces (1-69)
    while (choices.length < totalChoices) {
      const randomFace = Math.floor(Math.random() * 69) + 1;
      if (!choices.includes(randomFace)) {
        choices.push(randomFace);
      }
    }
    
    // Shuffle array to randomize position of correct answer
    return choices.sort(() => Math.random() - 0.5);
  };
  
  const [faces] = useState(() => getChoices());

  // Generate image URLs for preloading
  const [imageUrls] = useState(() => {
    const urls: string[] = [];
    faces.forEach(face => {
      urls.push(`/images/Bild${face}.webp`);
      urls.push(`/images/Bild${face}.png`);
    });
    return urls;
  });

  useEffect(() => {
    const updateSize = () => {
      if (typeof window !== 'undefined') {
        const screenWidth = window.innerWidth;
        // Bilder um 15% größer machen als vorher
        const baseSize = Math.min(screenWidth / 4, 140);
        const enlargedSize = baseSize * 1.15; // 15% größer
        setFaceSize(Math.max(enlargedSize, 115)); // Minimum auch um 15% erhöht (100 * 1.15)
      }
    };

    updateSize();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateSize);
      return () => window.removeEventListener('resize', updateSize);
    }
  }, []);

  const handleImageError = (faceNumber: number) => {
    setImageErrors(prev => ({ ...prev, [faceNumber]: true }));
  };

  const handleImageLoad = (faceNumber: number) => {
    setLoadedImages(prev => new Set(prev).add(faceNumber));
  };

  const handleFaceClick = (selectedFace: number) => {
    if (!addPoints || !trackTaskAttempt || !reduceMathLevelOnError || !setFace1Level || !setFace1Streak) {
      console.error('Missing context functions');
      return;
    }

    // Show click animation
    setClickedFace(selectedFace);

    const currentLevel = face1Level || 1;
    const currentStreak = face1Streak || 0;
    
    console.log(`Face1Recall Level ${currentLevel}: Expected face ${targetFace}, selected face ${selectedFace}`);
    
    // Check if selection is correct
    const isCorrect = selectedFace === targetFace;
    
    if (isCorrect) {
      // Add points (this will also track the attempt)
      addPoints('face1Task', true, currentLevel);
      
      // Increase streak
      const newStreak = currentStreak + 1;
      setFace1Streak(newStreak);
      
      // Level up after 3 correct answers (but not beyond level 3)
      if (newStreak >= 3 && currentLevel < 3) {
        setFace1Level(currentLevel + 1);
        setFace1Streak(0); // Reset streak after level up
        console.log(`Face1Task: Level up to ${currentLevel + 1}`);
      }
    } else {
      // Track false attempt
      trackTaskAttempt('face1Task', false);
      reduceMathLevelOnError(); // Reduce MathLevel on error
      
      // Reset streak
      setFace1Streak(0);
      
      // Level down on wrong answer (except level 1)
      if (currentLevel > 1) {
        setFace1Level(currentLevel - 1);
        console.log(`Face1Task: Level down to ${currentLevel - 1}`);
      }
    }

    // Navigate to next task after animation
    setTimeout(() => {
      setClickedFace(null);
      navigateToNextTask && navigateToNextTask();
    }, 200);
  };

  const TaskContent = () => (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-8 bg-[#dfdfdfff]">
      <div className="bg-[#dfdfdfff] p-4 sm:p-8 max-w-4xl w-full">
        <p className="text-base sm:text-lg font-semibold text-gray-800 text-center mb-6 sm:mb-8">
          {t('face1Recall.instruction')} (Level {face1Level || 1})
        </p>
        
        <div className={`grid gap-4 sm:gap-6 justify-items-center max-w-4xl mx-auto ${
          faces.length === 4 ? 'grid-cols-2' : 
          faces.length === 6 ? 'grid-cols-2 sm:grid-cols-3' :
          'grid-cols-2 sm:grid-cols-4'
        }`}>
          {faces.map((faceNumber) => {
            const hasError = imageErrors[faceNumber];
            
            return (
              <button
                key={faceNumber}
                className={`relative border-2 rounded-lg overflow-hidden transition-all duration-200 border-gray-300 hover:border-gray-400 ${
                  hasError ? 'bg-gray-100' : 'bg-white'
                } ${
                  clickedFace === faceNumber ? 'scale-110' : 'scale-100'
                }`}
                style={{
                  width: `${faceSize}px`,
                  height: `${faceSize}px`,
                }}
                onClick={() => handleFaceClick(faceNumber)}
              >
                {hasError ? (
                  // Fallback placeholder if image is missing
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <div className="text-3xl text-gray-400 mb-1">👤</div>
                    <p className="text-xs font-semibold text-gray-600">{faceNumber}</p>
                  </div>
                ) : (
                  <OptimizedImage
                    faceNumber={faceNumber}
                    alt={`Face ${faceNumber}`}
                    className="w-full h-full object-cover"
                    onLoad={() => handleImageLoad(faceNumber)}
                    onError={() => handleImageError(faceNumber)}
                    data-face={faceNumber}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <ScreenLoader
      imageUrls={imageUrls}
      minLoadTime={1000}
    >
      <TaskContent />
    </ScreenLoader>
  );
}