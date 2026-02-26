'use client';
import React, { useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GlobalContext } from '../context/GlobalContext';

interface Face2RecallProps {
  onComplete?: () => void;
}

export default function Face2Recall({ onComplete }: Face2RecallProps) {
  const contextValue = useContext(GlobalContext);
  const { 
    face2Data, 
    face2Level, 
    setFace2Level,
    face2Streak,
    setFace2Streak,
    addPoints, 
    trackTaskAttempt, 
    reduceMathLevelOnError, 
    navigateToNextTask 
  } = contextValue || {};
  const { t } = useTranslation();
  
  const [imageErrors, setImageErrors] = useState<{[key: number]: boolean}>({});
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [allImagesLoaded, setAllImagesLoaded] = useState<boolean>(false);
  const [selectedFaces, setSelectedFaces] = useState<Set<number>>(new Set());
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Responsive sizing
  const [faceSize, setFaceSize] = useState(110);

  // Get target faces from context
  const targetFaces = face2Data?.targetFaces || [];
  
  // Generate choice faces based on level (4, 6, or 8 total faces with the 4 target faces included)
  const getChoices = () => {
    const currentLevel = face2Level || 1;
    const choices = [...targetFaces]; // Start with the 4 target faces
    
    // Level-based total choices
    let totalChoices;
    switch (currentLevel) {
      case 1:
        totalChoices = 6; // 4 targets + 2 distractors
        break;
      case 2:
        totalChoices = 8; // 4 targets + 4 distractors
        break;
      case 3:
      default:
        totalChoices = 10; // 4 targets + 6 distractors
        break;
    }
    
    // Generate random distractors from Face1 range (since Face2 images don't exist yet)
    const faceRange = { min: 1, max: 69 };
    while (choices.length < totalChoices) {
      const randomFace = Math.floor(Math.random() * (faceRange.max - faceRange.min + 1)) + faceRange.min;
      if (!choices.includes(randomFace)) {
        choices.push(randomFace);
      }
    }
    
    // Shuffle array to randomize positions
    return choices.sort(() => Math.random() - 0.5);
  };
  
  const [choices] = useState(() => getChoices());

  useEffect(() => {
    const updateSize = () => {
      if (typeof window !== 'undefined') {
        const screenWidth = window.innerWidth;
        const baseSize = Math.min(screenWidth / 5, 120);
        setFaceSize(Math.max(baseSize, 90));
      }
    };

    updateSize();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateSize);
      return () => window.removeEventListener('resize', updateSize);
    }
  }, []);

  // Check if all images are loaded
  useEffect(() => {
    if (choices.length > 0) {
      const totalImages = choices.length;
      const loadedCount = loadedImages.size + Object.keys(imageErrors).length;
      
      if (loadedCount >= totalImages) {
        setAllImagesLoaded(true);
      }
    }
  }, [choices.length, loadedImages.size, imageErrors]);

  const handleImageError = (faceNumber: number) => {
    setImageErrors(prev => ({ ...prev, [faceNumber]: true }));
  };

  const handleImageLoad = (faceNumber: number) => {
    setLoadedImages(prev => new Set(prev).add(faceNumber));
  };

  const handleFaceClick = (selectedFace: number) => {
    if (isCompleted) return;
    
    if (selectedFaces.has(selectedFace)) {
      // Deselect if already selected
      setSelectedFaces(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedFace);
        return newSet;
      });
    } else {
      // Select the face
      setSelectedFaces(prev => new Set(prev).add(selectedFace));
    }
  };

  const handleSubmit = () => {
    if (isCompleted || selectedFaces.size === 0) return;
    
    if (!addPoints || !trackTaskAttempt || !reduceMathLevelOnError || !setFace2Level || !setFace2Streak) {
      console.error('Missing context functions');
      return;
    }

    const currentLevel = face2Level || 1;
    const currentStreak = face2Streak || 0;
    
    // Check how many correct faces were selected
    const correctSelections = Array.from(selectedFaces).filter(face => targetFaces.includes(face));
    const incorrectSelections = Array.from(selectedFaces).filter(face => !targetFaces.includes(face));
    const missedFaces = targetFaces.filter(face => !selectedFaces.has(face));
    
    console.log(`Face2Recall Level ${currentLevel}: Selected ${selectedFaces.size} faces`);
    console.log(`Correct: ${correctSelections.length}/${targetFaces.length}, Incorrect: ${incorrectSelections.length}, Missed: ${missedFaces.length}`);
    
    // Consider it correct only if all target faces are selected and no incorrect faces
    const isCorrect = correctSelections.length === targetFaces.length && incorrectSelections.length === 0;
    
    if (isCorrect) {
      addPoints('face2Task', true, face2Level || 1);
      const newStreak = currentStreak + 1;
      setFace2Streak(newStreak);
      
      // Level up after 3 correct answers (but not beyond level 3)
      if (newStreak >= 3 && currentLevel < 3) {
        setFace2Level(currentLevel + 1);
        setFace2Streak(0);
        console.log(`Face2Task: Level up to ${currentLevel + 1}`);
      }
    } else {
      trackTaskAttempt('face2Task', false);
      reduceMathLevelOnError();
      setFace2Streak(0);
      
      // Level down on wrong answer (except level 1)
      if (currentLevel > 1) {
        setFace2Level(currentLevel - 1);
        console.log(`Face2Task: Level down to ${currentLevel - 1}`);
      }
    }

    setIsCompleted(true);
    
    // Navigate to next task after a short delay
    setTimeout(() => {
      navigateToNextTask && navigateToNextTask();
    }, 1500);
  };

  // Don't render main content until all images are loaded
  if (!allImagesLoaded) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-8 bg-[#dfdfdfff]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        {/* Preload images invisibly to track loading */}
        {choices.length > 0 && (
          <div className="absolute opacity-0 pointer-events-none">
            {choices.map((faceNumber) => (
              <img
                key={`preload-${faceNumber}`}
                src={`/images/Bild${faceNumber}.png`}
                alt={`Preload Face2 ${faceNumber}`}
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
        <p className="text-base sm:text-lg font-semibold text-gray-800 text-center mb-2">
          {t('face2Recall.instruction', 'Select all faces you remember')} (Level {face2Level || 1})
        </p>
        <p className="text-sm text-gray-600 text-center mb-6">
          Selected: {selectedFaces.size} | Expected: {targetFaces.length}
        </p>
        
        <div className={`grid gap-3 sm:gap-4 justify-items-center max-w-5xl mx-auto mb-6 ${
          choices.length <= 6 ? 'grid-cols-2 sm:grid-cols-3' : 
          'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
        }`}>
          {choices.map((faceNumber) => {
            const hasError = imageErrors[faceNumber];
            const isSelected = selectedFaces.has(faceNumber);
            const isTarget = targetFaces.includes(faceNumber);
            const isCorrectSelection = isCompleted && isSelected && isTarget;
            const isIncorrectSelection = isCompleted && isSelected && !isTarget;
            const isMissed = isCompleted && !isSelected && isTarget;
            
            return (
              <button
                key={faceNumber}
                className={`relative border-2 rounded-lg overflow-hidden transition-all duration-200 ${
                  hasError ? 'bg-gray-100 border-gray-300' : 
                  isCorrectSelection ? 'border-green-500 bg-green-50' :
                  isIncorrectSelection ? 'border-red-500 bg-red-50' :
                  isMissed ? 'border-orange-500 bg-orange-50' :
                  isSelected ? 'border-blue-500 bg-blue-50' : 
                  'bg-white border-gray-300 hover:border-gray-400'
                } ${!isCompleted ? 'hover:scale-105' : ''}`}
                style={{
                  width: `${faceSize}px`,
                  height: `${faceSize}px`,
                }}
                onClick={() => handleFaceClick(faceNumber)}
                disabled={isCompleted}
              >
                {hasError ? (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <div className="text-2xl text-gray-400 mb-1">👤</div>
                    <p className="text-xs font-semibold text-gray-600">F2-{faceNumber}</p>
                  </div>
                ) : (
                  <img
                    src={`/images/Bild${faceNumber}.png`}
                    alt={`Face2 ${faceNumber}`}
                    className="w-full h-full object-cover"
                    onLoad={() => handleImageLoad(faceNumber)}
                    onError={() => handleImageError(faceNumber)}
                    data-face={faceNumber}
                  />
                )}
                
                {/* Selection indicator */}
                {isSelected && !isCompleted && (
                  <div className="absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
                
                {/* Result indicators */}
                {isCompleted && (
                  <div className={`absolute top-1 right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                    isCorrectSelection ? 'bg-green-500' :
                    isIncorrectSelection ? 'bg-red-500' :
                    isMissed ? 'bg-orange-500' : ''
                  }`}>
                    <span className="text-white text-xs">
                      {isCorrectSelection ? '✓' : isIncorrectSelection ? '✗' : isMissed ? '!' : ''}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        
        {!isCompleted && (
          <div className="flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={selectedFaces.size === 0}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
            >
              {t('face2Recall.submit', 'Submit Selection')} ({selectedFaces.size})
            </button>
          </div>
        )}
        
        {isCompleted && (
          <div className="text-center">
            <p className={`text-lg font-semibold mb-2 ${
              selectedFaces.size === targetFaces.length && 
              Array.from(selectedFaces).every(face => targetFaces.includes(face)) 
                ? 'text-green-600' : 'text-red-600'
            }`}>
              {Array.from(selectedFaces).every(face => targetFaces.includes(face)) && selectedFaces.size === targetFaces.length
                ? t('face2Recall.correct', 'Perfect! All correct faces selected!') 
                : t('face2Recall.incorrect', 'Not quite right. Try to remember all the faces next time.')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}