import React from 'react';
import { useGlobalContext } from '../context/GlobalContext';

interface ScoreDisplayProps {
  className?: string;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ className = "" }) => {
  const { totalPoints, currentPhase } = useGlobalContext();

  return (
    <div className={`
      absolute top-6 left-1/2 transform -translate-x-1/2 z-20 
      bg-white bg-opacity-90 backdrop-blur-sm 
      rounded-lg shadow-lg px-4 py-2 
      border border-gray-200
      ${className}
    `}>
      <div className="flex flex-col items-center">
        <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
          Punkte
        </div>
        <div className="text-2xl font-bold text-blue-600">
          {totalPoints}
        </div>
        {currentPhase > 0 && (
          <div className="text-xs text-gray-500 mt-1">
            Phase {currentPhase}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoreDisplay;