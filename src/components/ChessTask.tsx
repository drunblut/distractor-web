'use client';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdChevronRight } from 'react-icons/md';
import { GlobalContext } from '../context/GlobalContext';

interface ChessTaskProps {
  onComplete?: () => void;
}

export default function ChessTask({ onComplete }: ChessTaskProps) {
  const contextValue = useContext(GlobalContext);
  const { chessLevel, setCirclePositions } = contextValue || {};
  const { t } = useTranslation();
  const [localCirclePositions, setLocalCirclePositions] = useState<Array<{row: number, col: number}>>([]);

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

      setLocalCirclePositions(positions);
      if (setCirclePositions) {
        setCirclePositions(positions); // Store in GlobalContext
      }
    } else {
      setLocalCirclePositions([]);
      if (setCirclePositions) {
        setCirclePositions([]);
      }
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

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-8 bg-[#dfdfdfff]">
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
            onClick={() => onComplete && onComplete()}
            className="p-4 rounded-full transition-all duration-200 text-gray-600 hover:text-gray-800 hover:bg-gray-100 transform hover:scale-110"
          >
            <MdChevronRight size={72} />
          </button>
        </div>
      </div>
    </div>
  );
}