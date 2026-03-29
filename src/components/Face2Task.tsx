'use client';
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MdChevronRight } from 'react-icons/md';
import { GlobalContext } from '../context/GlobalContext';
import { generateMathProblem, MathProblem } from '../utils/mathUtils';

import ScoreDisplay from './ScoreDisplay';
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
    navigateToNextTask,
    mathLevel
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
  
  // Update initialLevel if face2Level changes (e.g., level up during gameplay)
  useEffect(() => {
    const currentLevel = face2Level || 1;
    if (currentLevel !== initialLevel) {
      console.log(`[Face2Task] Face2Level changed from ${initialLevel} to ${currentLevel}, updating initialLevel`);
      setInitialLevel(currentLevel);
    }
  }, [face2Level, initialLevel]);
  // Image loading states

  const [initialized, setInitialized] = useState(false);
  const initializationAttempted = useRef(false);
  
  // MathTask integration states
  const [showMathTask, setShowMathTask] = useState(false);
  const [mathProblem, setMathProblem] = useState<MathProblem | null>(null);
  const [mathInput, setMathInput] = useState('');
  const [mathAnswered, setMathAnswered] = useState(false);
  const mathInputRef = useRef<HTMLInputElement>(null);
  const [clickedFace, setClickedFace] = useState<number | null>(null);
  
  // Prevent double-clicks and multiple rapid submissions
  const [isProcessingClick, setIsProcessingClick] = useState(false);
  const [isProcessingMath, setIsProcessingMath] = useState(false);
  
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
    const currentLevel = initialLevel;
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
    // Prevent double-clicks and rapid clicking
    if (isProcessingClick) {
      console.log('[Face2Task] Click ignored - already processing');
      return;
    }
    
    setIsProcessingClick(true);
    
    // Show click animation - temporarily scale up
    setClickedFace(clickedFaceNumber);
    
    // Reset click animation after 200ms
    setTimeout(() => {
      setClickedFace(null);
      // Allow new clicks after animation
      setTimeout(() => setIsProcessingClick(false), 100);
    }, 200);
    
    console.log(`[Face2Task] Round ${currentRound}/${totalRounds}: Clicked face ${clickedFaceNumber}`);
    console.log(`[Face2Task] Before click - clickedFaces:`, Array.from(clickedFaces));
    
    // Check if this face has already been clicked in this cycle
    if (clickedFaces.has(clickedFaceNumber)) {
      console.log(`[Face2Task] ❌ FEHLER: Face ${clickedFaceNumber} already clicked - duplicate!`);
      // Don't add points for duplicate clicks, but still proceed with math task or round progression
    } else {
      console.log(`[Face2Task] ✅ KORREKT: Face ${clickedFaceNumber} - first time clicked!`);
      // Valid click - add to clicked set
      const newClickedFaces = new Set(clickedFaces).add(clickedFaceNumber);
      setClickedFaces(newClickedFaces);
      
      console.log('[Face2Task] Face registered as clicked');
    }

    // Save progress to context (including round progression)
    if (setFace2Data) {
      setFace2Data({ 
        targetFaces: originalFaces, 
        clickedFaces: clickedFaces.has(clickedFaceNumber) ? Array.from(clickedFaces) : Array.from(new Set(clickedFaces).add(clickedFaceNumber)), 
        currentRound: currentRound
      });
    }

    // Check if all rounds completed
    console.log(`[Face2Task] Navigation check: currentRound=${currentRound}, totalRounds=${totalRounds}, initialLevel=${initialLevel}`);
    if (currentRound >= totalRounds) {
      // All rounds completed - task complete
      console.log(`[Face2Task] 🎉 ALL ${totalRounds} ROUNDS COMPLETED - TASK COMPLETE! 🎉`);
      
      // Check if task was solved correctly: all images clicked exactly once
      const finalClickedFaces = clickedFaces.has(clickedFaceNumber) ? clickedFaces : new Set(clickedFaces).add(clickedFaceNumber);
      const isCorrectlySolved = finalClickedFaces.size === totalImages;
      
      console.log(`[Face2Task] Final check: Clicked faces: ${finalClickedFaces.size}/${totalImages}`);
      console.log(`[Face2Task] Task solved correctly: ${isCorrectlySolved}`);
      
      // Award points based on task completion
      console.log(`[Face2Task] Final scoring: Level ${initialLevel}, Correctly solved: ${isCorrectlySolved}`);
      if (addPoints) {
        if (isCorrectlySolved) {
          addPoints('face2Task', true, initialLevel);
          console.log(`[Face2Task] ✅ Face2Task completed correctly! Awarded points for Level ${initialLevel}`);
        } else {
          addPoints('face2Task', false);
          console.log(`[Face2Task] ❌ Face2Task completed incorrectly - no points awarded`);
        }
      } else {
        console.log(`[Face2Task] ⚠️ addPoints function not available!`);
      }
      
      // Reset face2Data when task is complete
      if (setFace2Data) {
        setFace2Data({ targetFaces: [], currentRound: 1, clickedFaces: [] });
      }
      
      // Navigate to next task
      setTimeout(() => {
        if (navigateToNextTask) {
          navigateToNextTask();
        }
      }, 500);
    } else {
      // More rounds to go - show math task before continuing
      console.log(`[Face2Task] Round ${currentRound} completed, ${totalRounds - currentRound} more to go`);
      
      // Generate and show math problem
      const problem = generateMathProblem(mathLevel || 1);
      setMathProblem(problem);
      setMathInput('');
      setMathAnswered(false);
      setShowMathTask(true);
      
      console.log('[Face2Task] Math task generated, waiting for user solution...');
    }
  };

  // Handle math task submission
  const handleMathSubmit = () => {
    if (!mathInput.trim() || mathAnswered || !mathProblem || isProcessingMath) return;
    
    setIsProcessingMath(true);

    const userAnswerNum = parseInt(mathInput);
    const isCorrect = userAnswerNum === mathProblem.correctAnswer;
    
    console.log(`[Face2Task] Math answer: ${userAnswerNum} (correct: ${mathProblem.correctAnswer}) - ${isCorrect ? 'CORRECT' : 'WRONG'}`);
    console.log(`[Face2Task] About to award MathTask points: Level ${mathLevel || 1}, Correct: ${isCorrect}`);
    
    setMathAnswered(true);
    
    if (addPoints) {
      // Add points immediately so they show in ScoreDisplay
      addPoints('mathTask', isCorrect, mathLevel || 1);
      console.log(`[Face2Task] ✅ Math task points awarded immediately for Level ${mathLevel || 1}`);
    }
    
    // Brief delay to allow ScoreDisplay to update before transitioning (like PieTask)
    setTimeout(() => {
      setShowMathTask(false);
      proceedToNextRound();
      setIsProcessingMath(false);
    }, 200); // Short delay to ensure UI updates are visible
  };

  // Handle math input key press
  const handleMathKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleMathSubmit();
    }
  };

  // Proceed to next round after math task completion
  const proceedToNextRound = () => {
    const nextRound = currentRound + 1;
    console.log(`[Face2Task] Proceeding from round ${currentRound} to round ${nextRound}/${totalRounds} (Level ${initialLevel})`);
    
    setCurrentRound(nextRound);
    shuffleFacesForNewRound();
    
    // Update context with new round
    if (setFace2Data) {
      setFace2Data({ 
        targetFaces: originalFaces, 
        clickedFaces: Array.from(clickedFaces), 
        currentRound: nextRound
      });
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
        
        // IMPORTANT: Use current face2Level for initialLevel, not saved data length
        // This prevents issues when user levels up but old data is still in context
        const currentLevelFromContext = face2Level || 1;
        setInitialLevel(currentLevelFromContext);
        console.log(`[Face2Task] Setting initial level to ${currentLevelFromContext} based on current face2Level (not saved data)`);
        
        // If saved data doesn't match current level, regenerate fresh data
        const expectedImages = getImagesForLevel(currentLevelFromContext);
        if (face2Data.targetFaces.length !== expectedImages) {
          console.log(`[Face2Task] Saved data has ${face2Data.targetFaces.length} faces but Level ${currentLevelFromContext} needs ${expectedImages}, regenerating...`);
          initializeFace2Task();
          initializationAttempted.current = true;
          return;
        }
        
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

  // Simple loading check
  if (!initialized || currentFaces.length === 0) {
    return (
      <div className="min-h-screen bg-[#dfdfdfff] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-8 bg-[#dfdfdfff] relative">
      {/* Score Display */}
      <ScoreDisplay />
      
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
            return (
              <button
                key={faceNumber}
                className={`relative border-2 rounded-lg overflow-hidden transition-all duration-200 bg-white border-gray-300 hover:border-gray-400 hover:scale-105 ${
                  clickedFace === faceNumber ? 'scale-125' : 'scale-100'
                }`}
                style={{
                  width: `${imageSize}px`,
                  height: `${imageSize}px`,
                }}
                onClick={() => handleFaceClick(faceNumber)}
              >
                <OptimizedImage
                  faceNumber={faceNumber}
                  alt={`Face2 ${faceNumber}`}
                  className="w-full h-full object-cover"
                  data-face={faceNumber}
                />
              </button>
            );
          })}
        </div>
        
        <div className="text-center text-sm text-gray-500">
          Click each face exactly once
        </div>
      </div>

      {/* Inline Math Task */}
      {showMathTask && mathProblem && (
        <div className="fixed inset-0 bg-[#dfdfdfff] z-50 overflow-hidden">
          <div className="flex flex-col h-screen p-5">
            <ScoreDisplay />
            <div className="flex-1 flex flex-col items-center justify-start md:justify-center">
              {/* Mobile spacing */}
              <div className="md:hidden" style={{ height: '20vh' }}></div>
            
              <div className="flex flex-col items-center max-w-md">
                {/* Math Equation */}
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-4xl font-bold text-gray-800">
                    {mathProblem?.num1}
                  </span>
                  <span className="text-4xl font-bold text-gray-600">
                    {mathProblem?.operator}
                  </span>
                  <span className="text-4xl font-bold text-gray-800">
                    {mathProblem?.num2}
                  </span>
                  <span className="text-4xl font-bold text-gray-800">
                    =
                  </span>
                  <div className="relative">
                    <input
                      ref={mathInputRef}
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={mathInput}
                      onChange={(e) => setMathInput(e.target.value.replace(/\D/g, ''))}
                      onKeyDown={handleMathKeyPress}
                      onClick={() => {
                        console.log('[Face2Task] Math input clicked, ensuring focus...');
                        mathInputRef.current?.focus();
                      }}
                      onTouchStart={() => {
                        console.log('[Face2Task] Math input touched, ensuring focus...');
                        mathInputRef.current?.focus();
                      }}
                      onFocus={() => console.log('[Face2Task] Math input focused successfully')}
                      maxLength={3}
                      placeholder="?"
                      disabled={mathAnswered}
                      autoFocus
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                      style={{ 
                        fontFamily: 'Arial, Helvetica, sans-serif',
                        WebkitTapHighlightColor: 'rgba(0,123,255,0.2)',
                        WebkitUserSelect: 'text'
                      }}
                      className={`math-input w-20 h-12 text-4xl font-bold text-center border-2 rounded-lg cursor-pointer transition-all
                        ${mathAnswered 
                          ? 'bg-gray-100 border-gray-300 text-gray-600'
                          : 'bg-white border-blue-400 text-gray-800 focus:border-blue-500 focus:outline-none hover:border-blue-500 hover:shadow-md'
                        }`}
                    />
                    {!mathInput && !mathAnswered && (
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-blue-600 font-medium whitespace-nowrap">
                        Tippen zum Eingeben
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button with Chevron */}
                <button
                  onClick={handleMathSubmit}
                  disabled={!mathInput.trim() || mathAnswered}
                  className={`p-4 rounded-full transition-all duration-200 mb-6 md:mb-0
                    ${!mathInput.trim() || mathAnswered 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 transform hover:scale-110'
                    }`}
                >
                  <MdChevronRight size={72} />
                </button>
                
                {/* Instruction */}
                <div className="text-sm text-gray-600 text-center mt-6 md:mt-6 opacity-50">
                  Geben Sie die Antwort ein und drücken Sie Enter oder den Pfeil
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}