'use client';
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { GlobalContext } from '../context/GlobalContext';
import OptimizedImage from './OptimizedImage';

interface Face2TaskProps {
  onComplete?: () => void;
}

export default function Face2Task({ onComplete }: Face2TaskProps) {
  const contextValue = useContext(GlobalContext);
  const { 
    face2Level, 
    setFace2Data, 
    face2Data,
    currentPhase,
    addPoints,
    taskQueue,
    currentTaskIndex,
    setCurrentTask,
    setCurrentTaskIndex,
    navigateToNextTask
  } = contextValue || {};
  const { t } = useTranslation();

  // Safety check for context
  if (!contextValue) {
    console.error('[Face2Task] GlobalContext is undefined');
    return null;
  }

  // Original face set that remains constant throughout all rounds
  const [originalFaces, setOriginalFaces] = useState<number[]>([]);
  // Current round's face arrangement
  const [currentFaces, setCurrentFaces] = useState<number[]>([]);
  // Track which faces have been clicked in this complete cycle
  const [clickedFaces, setClickedFaces] = useState<Set<number>>(new Set());
  // Current round number (1-4 for Level 1, 1-5 for Level 2, etc.)
  const [currentRound, setCurrentRound] = useState(1);
  // Store initial level to prevent changes mid-task
  const [initialLevel, setInitialLevel] = useState<number>(face2Level || 1);
  // Image loading states
  const [imageErrors, setImageErrors] = useState<{[key: number]: boolean}>({});
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [allImagesLoaded, setAllImagesLoaded] = useState<boolean>(false);
  const [initialized, setInitialized] = useState(false);
  const initializationAttempted = useRef(false);
  const [clickedFace, setClickedFace] = useState<number | null>(null);
  
  // Responsive image sizing
  const [imageSize, setImageSize] = useState(120);

  // Get number of images and rounds based on INITIAL level (fixed for entire task sequence)
  const getImagesForLevel = (level: number) => {
    switch (level) {
      case 1: return 4; // Level 1: 4 images, 4 rounds
      case 2: return 5; // Level 2: 5 images, 5 rounds  
      case 3: return 6; // Level 3: 6 images, 6 rounds
      default: return 4;
    }
  };

  const totalImages = getImagesForLevel(initialLevel);
  const totalRounds = totalImages;

  useEffect(() => {
    const updateSize = () => {
      if (typeof window !== 'undefined') {
        const screenWidth = window.innerWidth;
        const isMobile = screenWidth < 768;
        const baseSize = isMobile ? screenWidth * 0.35 : 150;
        setImageSize(Math.max(baseSize, 100));
      }
    };

    updateSize();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateSize);
      return () => window.removeEventListener('resize', updateSize);
    }
  }, []);

  // Initialize Face2Task with random faces - ONLY ONCE per complete task sequence
  const initializeFace2Task = () => {
    // Prevent re-initialization if faces already exist in local state
    if (originalFaces.length > 0) {
      console.log('[Face2Task] Already initialized in local state, skipping...');
      return;
    }
    
    console.log('[Face2Task] Initializing faces...');
    const currentLevel = face2Level || 1;
    setInitialLevel(currentLevel); // Store initial level
    const numImages = getImagesForLevel(currentLevel);
    
    // Generate random unique faces from Face1 range (1-69)
    const faces: number[] = [];
    while (faces.length < numImages) {
      const randomFace = Math.floor(Math.random() * 69) + 1;
      if (!faces.includes(randomFace)) {
        faces.push(randomFace);
      }
    }

    console.log('[Face2Task] Generated faces:', faces);
    setOriginalFaces(faces);
    
    // Shuffle for first round
    const shuffledFaces = [...faces].sort(() => Math.random() - 0.5);
    setCurrentFaces(shuffledFaces);
    
    // Store in context for persistence across rounds (include currentRound)
    if (setFace2Data) {
      setFace2Data({ targetFaces: faces, currentRound: 1, clickedFaces: [] });
    }
    
    console.log(`Face2Task Level ${currentLevel}: Setting ${numImages} target faces (Face1 range) - ${faces.join(', ')}`);
    console.log('[Face2Task] Initialization completed successfully');
    setInitialized(true);
  };

  // Shuffle faces for new round while keeping same set
  const shuffleFacesForNewRound = () => {
    if (originalFaces.length > 0) {
      const shuffled = [...originalFaces].sort(() => Math.random() - 0.5);
      console.log(`[Face2Task] Shuffling faces for round ${currentRound}:`, shuffled);
      setCurrentFaces(shuffled);
    } else {
      console.warn('[Face2Task] Cannot shuffle - originalFaces is empty');
    }
  };

  // Handle face click - check if it's a new face to click
  const handleFaceClick = (clickedFaceNumber: number) => {
    // Show click animation
    setClickedFace(clickedFaceNumber);
    
    console.log(`[Face2Task] Round ${currentRound}/${totalRounds}: Clicked face ${clickedFaceNumber}`);
    console.log(`[Face2Task] Before click - clickedFaces:`, Array.from(clickedFaces));
    
    // Check if this face has already been clicked in this cycle
    if (clickedFaces.has(clickedFaceNumber)) {
      console.log(`[Face2Task] ❌ FEHLER: Face ${clickedFaceNumber} already clicked - duplicate!`);
      // Don't update clicked faces for duplicate clicks
    } else {
      console.log(`[Face2Task] ✅ KORREKT: Face ${clickedFaceNumber} - first time clicked!`);
      // Valid click - add to clicked set (no immediate points)
      const newClickedFaces = new Set(clickedFaces).add(clickedFaceNumber);
      setClickedFaces(newClickedFaces);
      
      console.log('[Face2Task] Face registered as clicked - points will be awarded at task completion');
    }

    // Save progress to context (including round progression)
    if (setFace2Data) {
      setFace2Data({ 
        targetFaces: originalFaces, 
        clickedFaces: clickedFaces.has(clickedFaceNumber) ? Array.from(clickedFaces) : Array.from(new Set(clickedFaces).add(clickedFaceNumber)), 
        currentRound: currentRound
      });
    }

    // Check if all rounds completed (regardless of correct/incorrect clicks)
    console.log(`[Face2Task] Round completion check: currentRound ${currentRound} >= totalRounds ${totalRounds} ? ${currentRound >= totalRounds}`);
    
    if (currentRound >= totalRounds) {
      // All rounds completed - task complete
      console.log(`[Face2Task] 🎉 ALL ${totalRounds} ROUNDS COMPLETED - TASK COMPLETE! 🎉`);
      
      // Check if task was solved correctly: all images clicked exactly once
      const finalClickedFaces = clickedFaces.has(clickedFaceNumber) ? clickedFaces : new Set(clickedFaces).add(clickedFaceNumber);
      const isCorrectlySolved = finalClickedFaces.size === totalImages;
      
      console.log(`[Face2Task] Final check: Clicked faces: ${finalClickedFaces.size}/${totalImages}`);
      console.log(`[Face2Task] Clicked face numbers:`, Array.from(finalClickedFaces).sort((a,b) => a-b));
      console.log(`[Face2Task] Original faces:`, originalFaces.sort((a,b) => a-b));
      console.log(`[Face2Task] Task solved correctly: ${isCorrectlySolved}`);
      
      // Award points based on task completion
      if (addPoints) {
        const currentLevel = face2Level || 1;
        if (isCorrectlySolved) {
          addPoints('face2Task', true, currentLevel);
          console.log(`[Face2Task] ✅ Task completed correctly! Points awarded for Level ${currentLevel}`);
        } else {
          addPoints('face2Task', false);
          console.log(`[Face2Task] ❌ Task completed incorrectly - some faces not clicked exactly once`);
        }
      }
      
      // Reset face2Data when ALL face2Tasks in the phase are complete
      if (setFace2Data) {
        setFace2Data({ targetFaces: [], currentRound: 1, clickedFaces: [] });
      }
      
      // Use proper navigation system instead of manual queue management
      setTimeout(() => {
        setClickedFace(null);
        console.log(`[Face2Task] Using navigateToNextTask() to move to next task in queue`);
        if (navigateToNextTask) {
          navigateToNextTask();
        }
      }, 200);
    } else {
      // Continue to next round - only call onComplete for rounds 1-3
      console.log(`[Face2Task] Round ${currentRound}/${totalRounds} complete - going to MathTask then returning for next round`);
      const nextRound = currentRound + 1;
      setCurrentRound(nextRound);
      
      // Update context with next round number to persist across navigation
      if (setFace2Data) {
        setFace2Data({ 
          targetFaces: originalFaces,  // Keep original faces
          clickedFaces: Array.from(new Set(clickedFaces).add(clickedFaceNumber)),
          currentRound: nextRound  // Update round number
        });
      }
      
      // Navigate to MathTask after animation - only if not final round
      setTimeout(() => {
        setClickedFace(null);
        if (onComplete) {
          onComplete();
        }
      }, 200);
    }
  };

  useEffect(() => {
    // Always check for existing data when component mounts (regardless of initializationAttempted)
    console.log('[Face2Task] Component mounted - Phase:', currentPhase);
    console.log('[Face2Task] Existing face2Data:', face2Data);
    
    if (currentPhase === 3) {
      // Check if we have existing face2Data in context (from previous rounds)
      if (face2Data?.targetFaces && face2Data.targetFaces.length > 0 && !initialized) {
        console.log('[Face2Task] Restoring faces from context:', face2Data.targetFaces);
        
        // Set initial level based on number of target faces to maintain consistency
        const numFaces = face2Data.targetFaces.length;
        const derivedLevel = numFaces === 4 ? 1 : numFaces === 5 ? 2 : 3;
        setInitialLevel(derivedLevel);
        console.log(`[Face2Task] Setting initial level to ${derivedLevel} based on ${numFaces} faces`);
        
        setOriginalFaces(face2Data.targetFaces);
        
        // Always shuffle positions for current round, keeping same face numbers
        const shuffled = [...face2Data.targetFaces].sort(() => Math.random() - 0.5);
        setCurrentFaces(shuffled);
        
        // Restore clicked faces and round if available
        if (face2Data.clickedFaces && face2Data.clickedFaces.length > 0) {
          setClickedFaces(new Set(face2Data.clickedFaces));
          console.log('[Face2Task] Restored clicked faces:', face2Data.clickedFaces);
        }
        if (face2Data.currentRound && face2Data.currentRound >= 1) {
          setCurrentRound(face2Data.currentRound);
          console.log('[Face2Task] Restored round:', face2Data.currentRound);
        } else {
          setCurrentRound(1);
          console.log('[Face2Task] Setting round to 1 (default)');
        }
        
        setInitialized(true);
        initializationAttempted.current = true;
      } else if (!initializationAttempted.current) {
        // First time initialization only if never attempted
        console.log('[Face2Task] No existing data found, initializing fresh...');
        initializeFace2Task();
        initializationAttempted.current = true;
      }
    }
  }, [currentPhase, initialized]); // Only depend on currentPhase and initialized status

  // Ensure currentFaces are always displayed correctly - especially after returning from MathTask
  useEffect(() => {
    if (originalFaces.length > 0 && currentFaces.length === 0 && initialized) {
      console.log('[Face2Task] Faces missing after return from MathTask - reshuffling');
      const shuffled = [...originalFaces].sort(() => Math.random() - 0.5);
      setCurrentFaces(shuffled);
    }
  }, [originalFaces.length, currentFaces.length, initialized]); // Use lengths to avoid deep comparison

  // Check if all images are loaded
  useEffect(() => {
    if (currentFaces.length > 0) {
      const totalImages = currentFaces.length;
      const loadedCount = loadedImages.size + Object.keys(imageErrors).length;
      
      if (loadedCount >= totalImages) {
        setAllImagesLoaded(true);
      } else {
        setAllImagesLoaded(false);
      }
    }
  }, [currentFaces.length, loadedImages.size, imageErrors]);

  const handleImageLoad = (faceNumber: number) => {
    setLoadedImages(prev => new Set(prev).add(faceNumber));
  };

  const handleImageError = (faceNumber: number) => {
    setImageErrors(prev => ({ ...prev, [faceNumber]: true }));
  };

  // Don't render main content until all images are loaded
  if (!initialized || currentFaces.length === 0 || !allImagesLoaded) {
    return (
      <div className="min-h-screen bg-[#dfdfdfff] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        {/* Preload images invisibly to track loading */}
        {currentFaces.length > 0 && (
          <div className="absolute opacity-0 pointer-events-none">
            {currentFaces.map((faceNumber) => (
              <OptimizedImage
                key={`preload-${faceNumber}`}
                faceNumber={faceNumber}
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
      <div className="bg-[#dfdfdfff] p-4 sm:p-8 max-w-2xl w-full">
        <p className="text-base sm:text-lg font-semibold text-gray-800 text-center mb-2">
          {t('face2Task.instruction', 'Click on each face once')} (Level {initialLevel})
        </p>
        <p className="text-sm text-gray-600 text-center mb-4 sm:mb-6">
          Round {currentRound} of {totalRounds} • Clicked: {clickedFaces.size}/{totalImages}
        </p>
        
        {/* Dynamic Grid based on INITIAL level to maintain consistent layout */}
        <div className={`grid gap-4 sm:gap-6 justify-items-center max-w-md mx-auto mb-6 sm:mb-8 ${
          totalImages === 4 ? 'grid-cols-2' : 
          totalImages === 5 ? 'grid-cols-2 sm:grid-cols-3' :
          totalImages === 6 ? 'grid-cols-2 sm:grid-cols-3' :
          'grid-cols-2 sm:grid-cols-3'
        }`}>
          {currentFaces.map((faceNumber) => {
            const hasError = imageErrors[faceNumber];
            
            return (
              <button
                key={faceNumber}
                className={`relative border-2 rounded-lg overflow-hidden transition-all duration-200 ${
                  hasError 
                    ? 'bg-gray-100 border-gray-300' 
                    : 'bg-white border-gray-300 hover:border-gray-400 hover:scale-105'
                } ${
                  clickedFace === faceNumber ? 'scale-125' : 'scale-100'
                }`}
                style={{
                  width: `${imageSize}px`,
                  height: `${imageSize}px`,
                }}
                onClick={() => handleFaceClick(faceNumber)}
              >
                {hasError ? (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <div className="text-2xl text-gray-400 mb-1">👤</div>
                    <p className="text-xs font-semibold text-gray-600">F2-{faceNumber}</p>
                  </div>
                ) : (
                  <OptimizedImage
                    faceNumber={faceNumber}
                    alt={`Face2 ${faceNumber}`}
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
        
        <div className="text-center text-sm text-gray-500">
          Click each face exactly once • MathTask after each click
        </div>
      </div>
    </div>
  );
}