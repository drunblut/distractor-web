'use client';
import React, { useContext, useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MdChevronRight } from 'react-icons/md';
import { GlobalContext } from '../context/GlobalContext';
import { generateMathProblem, MathProblem } from '../utils/mathUtils';
import ScoreDisplay from './ScoreDisplay';

interface ChessTaskProps {
  onComplete?: () => void;
}

export default function ChessTask({ onComplete }: ChessTaskProps) {
  const contextValue = useContext(GlobalContext);
  const { chessLevel, setCirclePositions } = contextValue || {};
  const { t } = useTranslation();
  const [localCirclePositions, setLocalCirclePositions] = useState<Array<{row: number, col: number}>>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Inline Math Task state
  const [showMathTask, setShowMathTask] = useState(false);
  const [mathProblem, setMathProblem] = useState<MathProblem | null>(null);
  const [mathInput, setMathInput] = useState('');
  const [mathAnswered, setMathAnswered] = useState(false);
  const mathInputRef = useRef<HTMLInputElement>(null);
  
  // Get addPoints function from context
  const { addPoints, mathLevel, setCurrentTask } = contextValue || {};

  // Safety check for context
  if (!contextValue) {
    console.error('[ChessTask] GlobalContext is undefined');
    return null;
  }

  // Responsive chess board size
  const [chessSize, setChessSize] = useState(400);

  useEffect(() => {
    const updateSize = () => {
      if (typeof window !== 'undefined') {
        const screenWidth = window.innerWidth;
        const maxSize = Math.min(screenWidth * 0.8, 400);
        setChessSize(Math.max(maxSize, 280));
      }
    };

    updateSize();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateSize);
      return () => window.removeEventListener('resize', updateSize);
    }
  }, []);

  // Generate random positions for blue circles based on chessLevel
  useEffect(() => {
    const level = chessLevel || 1;
    if (level >= 1 && level <= 4) {
      const positions: Array<{row: number, col: number}> = [];
      const usedPositions = new Set();

      // Generate as many unique positions as the level indicates
      while (positions.length < level && positions.length < 25) { // max 25 fields
        const randomRow = Math.floor(Math.random() * 5);
        const randomCol = Math.floor(Math.random() * 5);
        const posKey = `${randomRow}-${randomCol}`;

        if (!usedPositions.has(posKey)) {
          positions.push({ row: randomRow, col: randomCol });
          usedPositions.add(posKey);
        }
      }

      console.log('[ChessTask DEBUG] Generated circle positions:', positions);
      setLocalCirclePositions(positions);
      
      // Store in GlobalContext
      if (setCirclePositions) {
        setCirclePositions(positions);
        console.log('[ChessTask DEBUG] Saved positions to GlobalContext');
      }
      
      // BACKUP: Also save to localStorage for reliability
      if (typeof window !== 'undefined') {
        localStorage.setItem('chessTaskCirclePositions', JSON.stringify(positions));
        console.log('[ChessTask DEBUG] Backup saved to localStorage');
      }
      
      setIsInitialized(true);
    } else {
      console.log('[ChessTask DEBUG] Invalid level, clearing positions');
      setLocalCirclePositions([]);
      if (setCirclePositions) {
        setCirclePositions([]);
      }
      // Clear localStorage too
      if (typeof window !== 'undefined') {
        localStorage.removeItem('chessTaskCirclePositions');
      }
      
      setIsInitialized(true);
    }
  }, [chessLevel, setCirclePositions]);

  const renderChessboard = () => {
    const squares = [];

    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        const isBlack = (row + col) % 2 === 1;
        const hasCircle = localCirclePositions.some(pos => pos.row === row && pos.col === col);
        
        squares.push(
          <div
            key={`${row}-${col}`}
            className={`flex items-center justify-center border border-gray-600 ${
              isBlack ? 'bg-gray-300' : 'bg-gray-200'
            }`}
            style={{
              width: `${chessSize / 5}px`,
              height: `${chessSize / 5}px`,
            }}
          >
            {hasCircle && (
              <div 
                className="bg-blue-500 border-2 border-gray-600 rounded-full"
                style={{
                  width: '90%',
                  height: '90%',
                }}
              />
            )}
          </div>
        );
      }
    }

    return squares;
  };

  // Navigate to next task using inline math task
  const handleNavigateToNext = () => {
    console.log('[ChessTask] handleNavigateToNext called - showing inline math task');
    console.log('[ChessTask] Final circle positions before math:', localCirclePositions);
    
    // Ensure data is saved
    if (setCirclePositions) {
      setCirclePositions(localCirclePositions);
      console.log('[ChessTask] Saved data before showing math task');
    }
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('chessTaskCirclePositions', JSON.stringify(localCirclePositions));
      console.log('[ChessTask] Saved to localStorage before showing math task');
    }
    
    // Generate and show inline math task
    if (mathLevel) {
      const problem = generateMathProblem(mathLevel);
      setMathProblem(problem);
      setMathInput('');
      setMathAnswered(false);
      setShowMathTask(true);
      
      console.log('[ChessTask] ✅ Inline math task shown');
      
      // Focus input immediately after direct user interaction
      setTimeout(() => {
        if (mathInputRef.current) {
          console.log('[ChessTask] Focusing math input after user click...');
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
    
    console.log('[ChessTask] Math answer submitted:', { userAnswer: userAnswerNum, correct: isCorrect });
    
    // Add points through the global context
    if (addPoints) {
      addPoints('mathTask', isCorrect, mathLevel || 1);
      console.log(`[ChessTask] Points added (correct: ${isCorrect}, level: ${mathLevel})`);
    }
    
    // Proceed to ChessRecall after brief delay
    setTimeout(() => {
      setShowMathTask(false);
      console.log('[ChessTask] Proceeding to ChessRecall after math completion');
      if (setCurrentTask) {
        setCurrentTask('chessRecall');
      } else {
        console.error('[ChessTask] No setCurrentTask function provided, falling back to onComplete');
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

  // Don't render main content until initialized
  if (!isInitialized) {
    return (
      <div className="h-screen bg-[#dfdfdfff] flex items-center justify-center overflow-hidden">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden">
        <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-8 bg-[#dfdfdfff] relative">
          {/* Score Display */}
          <ScoreDisplay />
      
      <div className="bg-[#dfdfdfff] p-4 sm:p-8 max-w-lg w-full">
          <p className="text-base sm:text-lg font-semibold text-gray-800 text-center mb-4 sm:mb-6">
            {(chessLevel || 1) === 1
              ? t('chessTask.instructionSingle')
              : t('chessTask.instructionMultiple')}
          </p>
          
          <div className="flex justify-center mb-6 sm:mb-8">
            <div 
              className="border border-gray-600 grid grid-cols-5"
              style={{
                width: `${chessSize}px`,
                height: `${chessSize}px`,
              }}
            >
              {renderChessboard()}
            </div>
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={(e) => {
                console.log('[ChessTask] Chevron button CLICK EVENT FIRED');
                console.log('[ChessTask] Event target:', e.target);
                console.log('[ChessTask] Current target:', e.currentTarget);
                
                e.preventDefault();
                e.stopPropagation();
                
                console.log('[ChessTask] Chevron button clicked - START');
                handleNavigateToNext();
                console.log('[ChessTask] Chevron button clicked - END');
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

            <ScoreDisplay />
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
                        console.log('[ChessTask] Math input clicked, ensuring focus...');
                        mathInputRef.current?.focus();
                      }}
                      onTouchStart={() => {
                        console.log('[ChessTask] Math input touched, ensuring focus...');
                        mathInputRef.current?.focus();
                      }}
                      onFocus={() => console.log('[ChessTask] Math input focused successfully')}
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}