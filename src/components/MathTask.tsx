'use client';
import React, { useState, useEffect } from 'react';
import { MdChevronRight } from 'react-icons/md';
import { generateMathProblem, MathProblem } from '../utils/mathUtils';
import { useGlobalContext } from '../context/GlobalContext';

interface MathTaskProps {
  onComplete: (correct: boolean) => void;
  onBack?: () => void;
}

export default function MathTask({ onComplete, onBack }: MathTaskProps) {
  const [inputValue, setInputValue] = useState('');
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  
  // Get global context functions
  const contextValue = useGlobalContext();
  const { addPoints, mathLevel } = contextValue || {};
  
  // Generate new math problem when component mounts
  useEffect(() => {
    const problem = generateMathProblem(mathLevel || 1); // Use current math level from context
    setCurrentProblem(problem);
    setInputValue('');
    setIsAnswered(false);
  }, [mathLevel]);
  
  // Handle answer submission
  const handleSubmit = () => {
    if (!inputValue.trim() || isAnswered || !currentProblem) return;
    
    const userAnswerNum = parseInt(inputValue);
    const isCorrect = userAnswerNum === currentProblem.correctAnswer;
    setIsAnswered(true);
    
    // Add points through the global context
    if (addPoints) {
      addPoints('mathTask', isCorrect, mathLevel || 1);
    }
    
    // Immediately proceed with result
    onComplete(isCorrect);
  };
  
  // Handle Enter key press
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  };

  if (!currentProblem) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#dfdfdfff]">
        <div className="text-lg text-gray-600">Aufgabe wird generiert...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#dfdfdfff] p-5">
      {/* Back Button */}
      {onBack && (
        <button
          className="self-start px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors mb-4"
          onClick={onBack}
        >
          ← Zurück
        </button>
      )}
      
      {/* Main Content - Different layout for small vs large screens */}
      <div className="flex-1 flex flex-col">
        
        {/* Small screens: Upper third positioning */}
        <div className="md:hidden">
          {/* Push content to upper third */}
          <div style={{ height: '20vh' }}></div>
          
          <div className="flex flex-col items-center">
            {/* Math Equation */}
            <div className="flex items-center gap-4 mb-8">
              <span className="text-4xl font-bold text-gray-800">
                {currentProblem.num1}
              </span>
              <span className="text-4xl font-bold text-gray-600">
                {currentProblem.operator}
              </span>
              <span className="text-4xl font-bold text-gray-800">
                {currentProblem.num2}
              </span>
              <span className="text-4xl font-bold text-gray-800">
                =
              </span>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                maxLength={3}
                placeholder="?"
                disabled={isAnswered}
                autoFocus
                style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
                className={`math-input w-20 h-12 text-3xl font-bold text-center border-2 rounded-lg 
                  ${isAnswered 
                    ? 'bg-gray-100 border-gray-300 text-gray-600' 
                    : 'bg-white border-gray-400 text-gray-800 focus:border-blue-500 focus:outline-none'
                  }`}
              />
            </div>
            

            {/* Submit Button positioned below */}
            <button
              onClick={handleSubmit}
              disabled={!inputValue.trim() || isAnswered}
              className={`p-4 rounded-full transition-all duration-200 mb-6
                ${!inputValue.trim() || isAnswered 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 transform hover:scale-110'
                }`}
            >
              <MdChevronRight size={72} />
            </button>
            
            {/* Instruction */}
            <div className="text-sm text-gray-600 text-center opacity-50">
              Geben Sie die Antwort ein und drücken Sie Enter oder den Pfeil
            </div>
          </div>
        </div>

        {/* Large screens: Centered layout */}
        <div className="hidden md:flex md:flex-col md:items-center md:justify-center md:flex-1">
          <div className="flex flex-col items-center max-w-md">
            {/* Math Equation */}
            <div className="flex items-center gap-4 mb-8">
              <span className="text-4xl font-bold text-gray-800">
                {currentProblem.num1}
              </span>
              <span className="text-4xl font-bold text-gray-600">
                {currentProblem.operator}
              </span>
              <span className="text-4xl font-bold text-gray-800">
                {currentProblem.num2}
              </span>
              <span className="text-4xl font-bold text-gray-800">
                =
              </span>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                maxLength={3}
                placeholder="?"
                disabled={isAnswered}
                autoFocus
                style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
                className={`math-input w-20 h-12 text-3xl font-bold text-center border-2 rounded-lg 
                  ${isAnswered 
                    ? 'bg-gray-100 border-gray-300 text-gray-600' 
                    : 'bg-white border-gray-400 text-gray-800 focus:border-blue-500 focus:outline-none'
                  }`}
              />
            </div>
            

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!inputValue.trim() || isAnswered}
              className={`p-4 rounded-full transition-all duration-200 
                ${!inputValue.trim() || isAnswered 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 transform hover:scale-110'
                }`}
            >
              <MdChevronRight size={72} />
            </button>
            
            {/* Instruction */}
            <div className="text-sm text-gray-600 text-center mt-6 opacity-50">
              Geben Sie die Antwort ein und drücken Sie Enter oder den Pfeil
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}