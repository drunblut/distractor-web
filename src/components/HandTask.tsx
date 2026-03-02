'use client';
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MdChevronRight } from 'react-icons/md';
import { GlobalContext } from '../context/GlobalContext';
import { generateMathProblem, MathProblem } from '../utils/mathUtils';
import ScoreDisplay from './ScoreDisplay';
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
  const [isTaskInitialized, setIsTaskInitialized] = useState(false);
  
  // Inline Math Task state
  const [showMathTask, setShowMathTask] = useState(false);
  const [mathProblem, setMathProblem] = useState<MathProblem | null>(null);
  const [mathInput, setMathInput] = useState('');
  const [mathAnswered, setMathAnswered] = useState(false);
  const mathInputRef = useRef<HTMLInputElement>(null);
  
  // Get functions from context
  const { addPoints, mathLevel, setCurrentTask } = contextValue || {};
  
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
    
    setIsTaskInitialized(true);
  };

  useEffect(() => {
    initializeHandTask();
  }, []);

  // Navigate to next task using inline math task
  const handleNavigateToNext = () => {
    console.log('[HandTask] handleNavigateToNext called - showing inline math task');
    console.log('[HandTask] Hand data before math:', { selectedImage, selectedCoords });
    
    // Generate and show inline math task
    if (mathLevel) {
      const problem = generateMathProblem(mathLevel);
      setMathProblem(problem);
      setMathInput('');
      setMathAnswered(false);
      setShowMathTask(true);
      
      console.log('[HandTask] ✅ Inline math task shown');
      
      // Focus input immediately after direct user interaction
      setTimeout(() => {
        if (mathInputRef.current) {
          console.log('[HandTask] Focusing math input after user click...');
          mathInputRef.current.focus();
          mathInputRef.current.click();
        }
      }, 50);
    }
  };
  
  // Handle math task answer submission
  const handleMathSubmit = () => {
    if (!mathInput.trim() || mathAnswered || !mathProblem) return;
    
    const userAnswerNum = parseInt(mathInput);
    const isCorrect = userAnswerNum === mathProblem.correctAnswer;
    setMathAnswered(true);
    
    console.log('[HandTask] Math answer submitted:', { userAnswer: userAnswerNum, correct: isCorrect });
    
    // Add points through the global context
    if (addPoints) {
      addPoints('mathTask', isCorrect, mathLevel || 1);
      console.log(`[HandTask] Points added (correct: ${isCorrect}, level: ${mathLevel})`);
    }
    
    // Proceed to HandRecall after brief delay
    setTimeout(() => {
      setShowMathTask(false);
      console.log('[HandTask] Proceeding to HandRecall after math completion');
      if (setCurrentTask) {
        setCurrentTask('handRecall');
      } else {
        console.error('[HandTask] No setCurrentTask function provided, falling back to onComplete');
        if (onComplete) {
          onComplete();
        }
      }
    }, 0);
  };
  
  // Handle Enter key press in math input
  const handleMathKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !mathAnswered) {
      handleMathSubmit();
    }
  };

  // Show loading indicator while initializing or while image is loading
  if (!isTaskInitialized || !imageLoaded || !selectedImage) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-8 bg-[#dfdfdfff]">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-base text-gray-600 text-center font-medium">
            Wird geladen...
          </p>
        </div>
        
        {/* Invisible preload image */}
        {isTaskInitialized && selectedImage && (
          <div className="opacity-0 pointer-events-none absolute">
            <img
              src={`/images/${selectedImage}`}
              alt="Preload"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(true)} // Fallback in case of error
            />
          </div>
        )}
      </div>
    );
  }

  const originalSize = 320; // Original coordinate system size
  const scale = imageSize / originalSize;

  return (
    <div className="h-screen overflow-hidden">
      <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-8 bg-[#dfdfdfff] relative">
        {/* Score Display */}
        <ScoreDisplay />
      
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
            onClick={(e) => {
              console.log('[HandTask] Chevron button clicked');
              e.preventDefault();
              e.stopPropagation();
              handleNavigateToNext();
            }}
            className="p-4 rounded-full transition-all duration-200 text-gray-600 hover:text-gray-800 hover:bg-gray-100 transform hover:scale-110"
            style={{ cursor: 'pointer', pointerEvents: 'auto' }}
            type="button"
          >
            <MdChevronRight size={72} />
          </button>
        </div>
      </div>
    </div>
      
      {/* Inline Math Task */}
      {showMathTask && mathProblem && (
        <div className="fixed inset-0 bg-[#dfdfdfff] z-50 overflow-hidden">
          <div className="flex flex-col h-screen p-5">
            {/* Score Display */}
            <ScoreDisplay />
            
            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-start md:justify-center">
              {/* Mobile spacing */}
              <div className="md:hidden" style={{ height: '20vh' }}></div>
            
              <div className="flex flex-col items-center max-w-md">
                {/* Math Equation */}
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-4xl font-bold text-gray-800">
                    {mathProblem.num1}
                  </span>
                  <span className="text-4xl font-bold text-gray-600">
                    {mathProblem.operator}
                  </span>
                  <span className="text-4xl font-bold text-gray-800">
                    {mathProblem.num2}
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
                        console.log('[HandTask] Math input clicked, ensuring focus...');
                        mathInputRef.current?.focus();
                      }}
                      onTouchStart={() => {
                        console.log('[HandTask] Math input touched, ensuring focus...');
                        mathInputRef.current?.focus();
                      }}
                      onFocus={() => console.log('[HandTask] Math input focused successfully')}
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
                      className={`math-input w-20 h-12 text-3xl font-bold text-center border-2 rounded-lg cursor-pointer transition-all
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