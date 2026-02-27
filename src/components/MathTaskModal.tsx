'use client';
import React, { useState, useEffect, useRef } from 'react';
import { generateMathProblem, MathProblem } from '../utils/mathUtils';
import { useGlobalContext } from '../context/GlobalContext';

interface MathTaskModalProps {
  isOpen: boolean;
  onComplete: (correct: boolean) => void;
  onClose: () => void;
}

export default function MathTaskModal({ isOpen, onComplete, onClose }: MathTaskModalProps) {
  const [inputValue, setInputValue] = useState('');
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  
  // Ref for input field to handle focus
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Get global context functions
  const contextValue = useGlobalContext();
  const { addPoints, mathLevel } = contextValue || {};

  // Generate new problem when modal opens
  useEffect(() => {
    if (isOpen && mathLevel) {
      console.log('[MathTaskModal] Modal opened, generating new problem...');
      const problem = generateMathProblem(mathLevel);
      setCurrentProblem(problem);
      setInputValue('');
      setIsAnswered(false);
    }
  }, [isOpen, mathLevel]);

  // Auto-focus input when modal opens and problem is ready
  useEffect(() => {
    if (isOpen && currentProblem && inputRef.current) {
      console.log('[MathTaskModal] Auto-focusing input...');
      
      const focusInput = () => {
        if (inputRef.current) {
          console.log('[MathTaskModal] Attempting focus...');
          inputRef.current.focus();
          inputRef.current.click(); // Additional trigger for mobile
          console.log('[MathTaskModal] Focus attempt completed, activeElement:', document.activeElement);
        }
      };
      
      // Multiple focus attempts with different timings
      const timer1 = setTimeout(focusInput, 50);
      const timer2 = setTimeout(focusInput, 150);
      const timer3 = setTimeout(focusInput, 300);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [isOpen, currentProblem]);

  // Additional focus attempt after render is complete
  useEffect(() => {
    if (isOpen && currentProblem && !isAnswered) {
      const finalFocusAttempt = setTimeout(() => {
        if (inputRef.current) {
          console.log('[MathTaskModal] Final focus attempt...');
          inputRef.current.focus();
          
          // Check if focus was successful
          setTimeout(() => {
            const focused = document.activeElement === inputRef.current;
            console.log('[MathTaskModal] Focus successful:', focused);
          }, 50);
        }
      }, 500);
      
      return () => clearTimeout(finalFocusAttempt);
    }
  }, [isOpen, currentProblem, isAnswered]);

  // Handle answer submission
  const handleSubmit = () => {
    if (!inputValue.trim() || isAnswered || !currentProblem) return;
    
    const userAnswerNum = parseInt(inputValue);
    const isCorrect = userAnswerNum === currentProblem.correctAnswer;
    setIsAnswered(true);
    
    console.log('[MathTaskModal] Answer submitted:', { userAnswer: userAnswerNum, correct: isCorrect });
    
    // Add points through the global context
    if (addPoints) {
      addPoints('mathTask', isCorrect, mathLevel || 1);
    }
    
    // Close modal and proceed after a short delay to show result
    setTimeout(() => {
      onComplete(isCorrect);
      onClose();
    }, 1500);
  };
  
  // Handle Enter key press
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !isAnswered) {
      handleSubmit();
    }
  };

  // Handle backdrop click to close modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !currentProblem) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-[#dfdfdfff] rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Rechenaufgabe</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>
        
        {/* Math Problem Content */}
        <div className="p-6">
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
              <div className="relative">
                <input
                  ref={inputRef}
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={handleKeyPress}
                  onClick={() => {
                    console.log('[MathTaskModal] Input clicked, ensuring focus...');
                    inputRef.current?.focus();
                  }}
                  onTouchStart={() => {
                    console.log('[MathTaskModal] Input touched, ensuring focus...');
                    inputRef.current?.focus();
                  }}
                  onFocus={() => console.log('[MathTaskModal] Input focused successfully')}
                  maxLength={3}
                  placeholder="?"
                  disabled={isAnswered}
                  autoFocus
                  autoComplete="off"
                  autoCorrect="off"
                  className={`w-16 h-16 text-3xl font-bold text-center border-2 rounded-lg transition-all duration-300 ${
                    isAnswered
                      ? parseInt(inputValue) === currentProblem.correctAnswer
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-300 bg-white text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                  }`}
                />
                
                {/* Result indicator */}
                {isAnswered && (
                  <div className={`absolute -right-8 top-1/2 transform -translate-y-1/2 text-2xl ${
                    parseInt(inputValue) === currentProblem.correctAnswer ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {parseInt(inputValue) === currentProblem.correctAnswer ? '✓' : '✗'}
                  </div>
                )}
              </div>
            </div>
            
            {/* Submit Button */}
            {!isAnswered && inputValue.trim() && (
              <button
                onClick={handleSubmit}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
              >
                Antwort überprüfen
              </button>
            )}
            
            {/* Result Message */}
            {isAnswered && (
              <div className={`text-center mt-4 ${
                parseInt(inputValue) === currentProblem.correctAnswer ? 'text-green-600' : 'text-red-600'
              }`}>
                <div className="text-lg font-semibold">
                  {parseInt(inputValue) === currentProblem.correctAnswer ? 'Richtig!' : 'Falsch!'}
                </div>
                {parseInt(inputValue) !== currentProblem.correctAnswer && (
                  <div className="text-sm mt-1">
                    Die richtige Antwort ist: {currentProblem.correctAnswer}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}