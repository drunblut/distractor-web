'use client';
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MdChevronRight } from 'react-icons/md';
import { GlobalContext } from '../context/GlobalContext';
import { generateMathProblem, MathProblem } from '../utils/mathUtils';
import ScoreDisplay from './ScoreDisplay';
import OptimizedImage from './OptimizedImage';

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

  const [targetFace, setTargetFace] = useState<number>(0);
  
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
    const faceNumber = getRandomInt(1, 69);
    
    setTargetFace(faceNumber);
    
    // Save face data to GlobalContext
    const currentLevel = face1Level || 1;
    console.log(`Face1Task Level ${currentLevel}: Setting target face - ${faceNumber}`);
    if (setFace1Data) {
      setFace1Data({ targetFace: faceNumber });
    }
  };

  useEffect(() => {
    initializeFace1Task();
  }, []);

  // Navigate to next task using inline math task
  const handleNavigateToNext = () => {
    console.log('[Face1Task] handleNavigateToNext called - showing inline math task');
    console.log('[Face1Task] Target face before math:', targetFace);
    
    // Generate and show inline math task
    if (mathLevel) {
      const problem = generateMathProblem(mathLevel);
      setMathProblem(problem);
      setMathInput('');
      setMathAnswered(false);
      setShowMathTask(true);
      
      console.log('[Face1Task] ✅ Inline math task shown');
      
      // Focus input immediately after direct user interaction
      setTimeout(() => {
        if (mathInputRef.current) {
          console.log('[Face1Task] Focusing math input after user click...');
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
    
    console.log('[Face1Task] Math answer submitted:', { userAnswer: userAnswerNum, correct: isCorrect });
    
    // Add points through the global context
    if (addPoints) {
      addPoints('mathTask', isCorrect, mathLevel || 1);
      console.log(`[Face1Task] Points added (correct: ${isCorrect}, level: ${mathLevel})`);
    }
    
    // Proceed to Face1Recall after brief delay
    setTimeout(() => {
      setShowMathTask(false);
      console.log('[Face1Task] Proceeding to Face1Recall after math completion');
      if (setCurrentTask) {
        setCurrentTask('face1Recall');
      } else {
        console.error('[Face1Task] No setCurrentTask function provided, falling back to onComplete');
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

  // Simple loading check
  if (targetFace === 0) {
    return (
      <div className="min-h-screen bg-[#dfdfdfff] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-8 bg-[#dfdfdfff] relative">
        {/* Score Display */}
        <ScoreDisplay />
        
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
              <OptimizedImage
                faceNumber={targetFace}
                alt={`Face ${targetFace}`}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={(e) => {
                console.log('[Face1Task] Chevron button clicked');
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
                        console.log('[Face1Task] Math input clicked, ensuring focus...');
                        mathInputRef.current?.focus();
                      }}
                      onTouchStart={() => {
                        console.log('[Face1Task] Math input touched, ensuring focus...');
                        mathInputRef.current?.focus();
                      }}
                      onFocus={() => console.log('[Face1Task] Math input focused successfully')}
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
    </>
  );
}