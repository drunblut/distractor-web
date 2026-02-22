'use client';
import React, { useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GlobalContext } from '../context/GlobalContext';

interface ChessRecallProps {
  onComplete?: () => void;
}

export default function ChessRecall({ onComplete }: ChessRecallProps) {
  console.log('[ChessRecall INIT] Component mounted with onComplete:', typeof onComplete);
  console.log('[ChessRecall INIT] onComplete function value:', onComplete);
  
  const contextValue = useContext(GlobalContext);
  const {
    chessLevel, 
    setChessLevel, 
    chessStreak, 
    setChessStreak, 
    circlePositions,
    reduceMathLevelOnError, 
    addPoints, 
    trackTaskAttempt,
    taskQueue,
    currentTaskIndex,
    setCurrentTaskIndex,
    setCurrentTask,
    navigateToNextTask
  } = contextValue || {};
  
  const { t } = useTranslation();
  const [showTemporaryCircle, setShowTemporaryCircle] = useState<{row: number, col: number} | null>(null);
  const [selectedPositions, setSelectedPositions] = useState<Array<{row: number, col: number}>>([]);

  // Get circle positions with localStorage backup
  let actualCirclePositions = circlePositions || [];
  
  // BACKUP: Try localStorage if context is empty
  if (actualCirclePositions.length === 0 && typeof window !== 'undefined') {
    const storedPositions = localStorage.getItem('chessTaskCirclePositions');
    if (storedPositions) {
      try {
        actualCirclePositions = JSON.parse(storedPositions);
        console.log('[ChessRecall DEBUG] Using localStorage positions:', actualCirclePositions);
      } catch (e) {
        console.warn('[ChessRecall DEBUG] Failed to parse localStorage positions');
      }
    }
  }
  
  // DEBUG: Log circle positions
  console.log('[ChessRecall DEBUG] contextCirclePositions:', circlePositions);
  console.log('[ChessRecall DEBUG] actualCirclePositions:', actualCirclePositions);

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

  const handleSquarePress = (row: number, col: number) => {
    console.log('[ChessRecall DEBUG] Square clicked:', { row, col });
    console.log('[ChessRecall DEBUG] Available positions to check against:', actualCirclePositions);
    console.log('[ChessRecall DEBUG] onComplete function available:', typeof onComplete === 'function');
    
    if (!setChessLevel || !setChessStreak || !addPoints || !trackTaskAttempt || !reduceMathLevelOnError) {
      console.error('[ChessRecall DEBUG] Missing context functions');
      return;
    }

    const currentLevel = chessLevel || 1;
    console.log('[ChessRecall DEBUG] Current level:', currentLevel);

    if (currentLevel === 1) {
      // Level 1: Original Logic - immediate feedback
      setShowTemporaryCircle({ row, col });

      setTimeout(() => {
        setShowTemporaryCircle(null);

        const isCorrect = actualCirclePositions.some(pos => pos.row === row && pos.col === col);
        console.log('[ChessRecall DEBUG] Level 1 - Is position correct?', isCorrect);
        
        if (isCorrect) {
          const newStreak = (chessStreak || 0) + 1;
          console.log('[ChessRecall DEBUG] Correct! New streak:', newStreak);
          setChessStreak(newStreak);

          // Add points
          addPoints('chessTask', true, chessLevel || 1);

          // Level up after 3 correct answers
          if (newStreak % 3 === 0 && currentLevel < 4) {
            console.log('[ChessRecall DEBUG] Level up! New level:', currentLevel + 1);
            setChessLevel(currentLevel + 1);
            setChessStreak(0);
            setTimeout(() => {
              console.log('[ChessRecall DEBUG] Calling onComplete after level up');
              if (onComplete) {
                console.log('[ChessRecall DEBUG] onComplete is being called!');
                onComplete();
              } else {
                console.error('[ChessRecall DEBUG] onComplete is missing!');
              }
            }, 200);
          } else {
            console.log('[ChessRecall DEBUG] Continue at same level, calling onComplete');
            setTimeout(() => {
              console.log('[ChessRecall DEBUG] Calling onComplete after correct answer');
              if (onComplete) {
                console.log('[ChessRecall DEBUG] onComplete is being called!');
                onComplete();
              } else {
                console.error('[ChessRecall DEBUG] onComplete is missing!');
              }
            }, 200);
          }
        } else {
          console.log('[ChessRecall DEBUG] Wrong answer - Level down on wrong answer (except level 1)');
          // Level down on wrong answer (except level 1)
          addPoints('chessTask', false);
          reduceMathLevelOnError(); // Reduce MathLevel on any error
          
          if (currentLevel > 1) {
            console.log('[ChessRecall DEBUG] Level down! New level:', currentLevel - 1);
            setChessLevel(currentLevel - 1);
            setChessStreak(0);
            setTimeout(() => {
              console.log('[ChessRecall DEBUG] Calling onComplete after level down');
              if (onComplete) {
                console.log('[ChessRecall DEBUG] onComplete is being called (wrong answer)!');
                onComplete();
              } else {
                console.error('[ChessRecall DEBUG] onComplete is missing (wrong answer)!');
              }
            }, 200);
          } else {
            console.log('[ChessRecall DEBUG] Stay at level 1, calling onComplete');
            setTimeout(() => {
              console.log('[ChessRecall DEBUG] Calling onComplete after wrong answer');
              if (onComplete) {
                console.log('[ChessRecall DEBUG] onComplete is being called (wrong level 1)!');
                onComplete();
              } else {
                console.error('[ChessRecall DEBUG] onComplete is missing (wrong level 1)!');
              }
            }, 200);
          }
        }
      }, 200);
    } else {
      // Level 2-4: Toggle functionality
      console.log('[ChessRecall DEBUG] Level > 1 - Toggle functionality');
      const isAlreadySelected = selectedPositions.some(pos => pos.row === row && pos.col === col);
      
      if (isAlreadySelected) {
        // Remove selection
        console.log('[ChessRecall DEBUG] Removing selection at:', { row, col });
        setSelectedPositions(prev => prev.filter(pos => !(pos.row === row && pos.col === col)));
      } else {
        // Add selection
        const newSelectedPositions = [...selectedPositions, { row, col }];
        console.log('[ChessRecall DEBUG] Adding selection, total selected:', newSelectedPositions.length);
        setSelectedPositions(newSelectedPositions);

        // Wait briefly for visual change to render, then check
        setTimeout(() => {
          // Check if correct number reached
          if (newSelectedPositions.length === currentLevel) {
            console.log('[ChessRecall DEBUG] All positions selected, checking correctness...');
            // Check correctness of all selections
            const allCorrect = newSelectedPositions.every(selected =>
              actualCirclePositions.some(circle => circle.row === selected.row && circle.col === selected.col)
            ) && newSelectedPositions.length === actualCirclePositions.length;

            console.log('[ChessRecall DEBUG] All positions correct?', allCorrect);

            if (allCorrect) {
              console.log('[ChessRecall DEBUG] All correct! Success.');
              const newStreak = (chessStreak || 0) + 1;
              console.log('[ChessRecall DEBUG] Correct! New streak:', newStreak);
              setChessStreak(newStreak);

              // Add points
              addPoints('chessTask', true, chessLevel || 1);

              // Level up after 3 correct answers
              if (newStreak % 3 === 0 && currentLevel < 4) {
                console.log('[ChessRecall DEBUG] Level up! New level:', currentLevel + 1);
                setChessLevel(currentLevel + 1);
                setChessStreak(0);
                setTimeout(() => {
                  setSelectedPositions([]);
                  console.log('[ChessRecall DEBUG] Multi-level: Calling onComplete after level up');
                  onComplete && onComplete();
                }, 200);
              } else {
                console.log('[ChessRecall DEBUG] Continue at same level, calling onComplete');
                setTimeout(() => {
                  setSelectedPositions([]);
                  console.log('[ChessRecall DEBUG] Multi-level: Calling onComplete after correct');
                  onComplete && onComplete();
                }, 200);
              }
            } else {
              console.log('[ChessRecall DEBUG] Wrong selections - Level down');
              // Level down on wrong answer
              addPoints('chessTask', false);
              reduceMathLevelOnError(); // Reduce MathLevel on error
              
              if (currentLevel > 1) {
                console.log('[ChessRecall DEBUG] Level down! New level:', currentLevel - 1);
                setChessLevel(currentLevel - 1);
                setChessStreak(0);
                setTimeout(() => {
                  setSelectedPositions([]);
                  console.log('[ChessRecall DEBUG] Multi-level: Calling onComplete after level down');
                  onComplete && onComplete();
                }, 200);
              } else {
                console.log('[ChessRecall DEBUG] Stay at level 1, calling onComplete');
                setTimeout(() => {
                  setSelectedPositions([]);
                  console.log('[ChessRecall DEBUG] Multi-level: Calling onComplete after wrong');
                  onComplete && onComplete();
                }, 200);
              }
            }
          }
        }, 50);
      }
    }
  };

  const renderChessboard = () => {
    const squares = [];

    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        const isBlack = (row + col) % 2 === 1;
        const hasTemporaryCircle = showTemporaryCircle &&
          showTemporaryCircle.row === row && showTemporaryCircle.col === col;
        const isSelected = selectedPositions.some(pos => pos.row === row && pos.col === col);
        
        squares.push(
          <button
            key={`${row}-${col}`}
            onClick={() => handleSquarePress(row, col)}
            className={`flex items-center justify-center border border-gray-600 transition-colors ${
              isBlack ? 'bg-gray-300 hover:bg-gray-400' : 'bg-gray-200 hover:bg-gray-300'
            }`}
            style={{
              width: `${chessSize / 5}px`,
              height: `${chessSize / 5}px`,
            }}
          >
            {(hasTemporaryCircle || isSelected) && (
              <div 
                className="bg-blue-500 border-2 border-gray-600 rounded-full"
                style={{
                  width: '90%',
                  height: '90%',
                }}
              />
            )}
          </button>
        );
      }
    }

    return squares;
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-8 bg-[#dfdfdfff]">
      <div className="bg-[#dfdfdfff] p-4 sm:p-8 max-w-lg w-full">
        <p className="text-base sm:text-lg font-semibold text-gray-800 text-center mb-4 sm:mb-6">
          {(chessLevel || 1) === 1
            ? t('chessRecall.instructionSingle')
            : t('chessRecall.instructionMultiple')}
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
        
        {/* Show current selections for levels > 1 */}
        {(chessLevel || 1) > 1 && selectedPositions.length > 0 && (
          <div className="text-center text-xs sm:text-sm text-gray-600 mb-4">
            Ausgewählt: {selectedPositions.length} von {chessLevel || 1} Feldern
          </div>
        )}
      </div>
    </div>
  );
}