'use client';
import React, { useState, useContext, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { GlobalContext } from '../context/GlobalContext';
import OptimizedImage from './OptimizedImage';

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
  const [allImagesLoaded, setAllImagesLoaded] = useState<boolean>(false);
  
  // Responsive sizing
  const [faceSize, setFaceSize] = useState(120);

  // Get target face from context (fallback to 1 if not available)
  const targetFace = face1Data?.targetFace || 1;
  
  // Generate choices including target and random distractors based on level
  const getChoices = useCallback(() => {
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
  }, [targetFace, face1Level]);
  
  const [faces, setFaces] = useState<number[]>([]);
  
  // Initialize faces when component mounts or when dependencies change
  useEffect(() => {
    if (targetFace && targetFace > 0) {
      const newFaces = getChoices();
      setFaces(newFaces);
      setLoadedImages(new Set()); // Reset loaded images
      setAllImagesLoaded(false); // Reset loading state
      console.log('[Face1Recall] Generated faces:', newFaces, 'for target:', targetFace);
    }
  }, [getChoices, targetFace]);

  // Check if all images are loaded
  useEffect(() => {
    if (faces.length > 0) {
      const totalImages = faces.length;
      const loadedCount = loadedImages.size + Object.keys(imageErrors).length;
      
      if (loadedCount >= totalImages) {
        setAllImagesLoaded(true);
      }
    }
  }, [faces.length, loadedImages.size, imageErrors]);

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

  const handleFaceClick = useCallback((selectedFace: number) => {
    if (!addPoints || !trackTaskAttempt || !reduceMathLevelOnError || !setFace1Level || !setFace1Streak) {
      console.error('[Face1Recall ERROR] Missing context functions');
      return;
    }

    console.log(`[Face1Recall] Face clicked: ${selectedFace}, Target: ${targetFace}`);

    // Show click animation
    setClickedFace(selectedFace);

    const currentLevel = face1Level || 1;
    const currentStreak = face1Streak || 0;
    
    // Check if selection is correct
    const isCorrect = selectedFace === targetFace;
    
    if (isCorrect) {
      console.log('[Face1Recall] Correct answer!');
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
      console.log('[Face1Recall] Wrong answer!');
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
      if (navigateToNextTask) {
        navigateToNextTask();
      }
    }, 200);
  }, [addPoints, trackTaskAttempt, reduceMathLevelOnError, setFace1Level, setFace1Streak, navigateToNextTask, targetFace, face1Level, face1Streak]);

  const TaskContent = () => {
    // Don't render until we have faces to show AND all images are loaded
    if (!faces || faces.length === 0 || !allImagesLoaded) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-[#dfdfdfff]">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
          {/* Preload images invisibly to track loading */}
          {faces.length > 0 && (
            <div className="absolute opacity-0 pointer-events-none">
              {faces.map((faceNumber) => (
                <OptimizedImage
                  key={`preload-${faceNumber}`}
                  faceNumber={faceNumber}
                  alt={`Preload Face ${faceNumber}`}
                  className="w-1 h-1"
                  onLoad={() => handleImageLoad(faceNumber)}
                  onError={() => handleImageError(faceNumber)}
                />
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
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
                className={`relative border-2 rounded-lg overflow-hidden transition-all duration-200 border-gray-300 hover:border-gray-400 cursor-pointer ${
                  hasError ? 'bg-gray-100' : 'bg-white'
                } ${
                  clickedFace === faceNumber ? 'scale-110' : 'scale-100'
                }`}
                style={{
                  width: `${faceSize}px`,
                  height: `${faceSize}px`,
                  pointerEvents: 'auto',
                  zIndex: 1
                }}
                onMouseDown={() => console.log('[Face1Recall] MouseDown on face:', faceNumber)}
                onMouseUp={() => {
                  console.log('[Face1Recall] MouseUp on face:', faceNumber);
                  console.log('[Face1Recall] Triggering handleFaceClick from MouseUp');
                  handleFaceClick(faceNumber);
                }}
                onTouchStart={() => console.log('[Face1Recall] TouchStart on face:', faceNumber)}
                onTouchEnd={() => {
                  console.log('[Face1Recall] TouchEnd on face:', faceNumber);
                  console.log('[Face1Recall] Triggering handleFaceClick from TouchEnd');
                  handleFaceClick(faceNumber);
                }}
                onClick={(e) => {
                  console.log('[Face1Recall DEBUG] Button clicked for face:', faceNumber);
                  console.log('[Face1Recall DEBUG] Event:', e);
                  console.log('[Face1Recall DEBUG] Current target:', e.currentTarget);
                  handleFaceClick(faceNumber);
                }}
                disabled={false}
                type="button"
              >
                {hasError ? (
                  // Fallback placeholder if image is missing
                  <div 
                    className="w-full h-full flex flex-col items-center justify-center"
                    onClick={() => {
                      console.log('[Face1Recall] Fallback div clicked:', faceNumber);
                      handleFaceClick(faceNumber);
                    }}
                  >
                    <div className="text-3xl text-gray-400 mb-1">👤</div>
                    <p className="text-xs font-semibold text-gray-600">{faceNumber}</p>
                  </div>
                ) : (
                  <>
                    <OptimizedImage
                      faceNumber={faceNumber}
                      alt={`Face ${faceNumber}`}
                      className="w-full h-full object-cover pointer-events-none"
                      onLoad={() => handleImageLoad(faceNumber)}
                      onError={() => handleImageError(faceNumber)}
                      data-face={faceNumber}
                    />
                    {/* DEBUG: Invisible click overlay */}
                    <div 
                      className="absolute inset-0 bg-transparent cursor-pointer z-10"
                      onClick={() => {
                        console.log('[Face1Recall] Overlay clicked for face:', faceNumber);
                        handleFaceClick(faceNumber);
                      }}
                      title={`Click to select face ${faceNumber}`}
                    />
                  </>
                )}
              </button>
            );
          })}
          </div>
        </div>
      </div>
    );
  };

  return <TaskContent />;
}