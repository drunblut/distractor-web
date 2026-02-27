'use client';
import React, { useState, useEffect, useRef } from 'react';
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
  const [hasStarted, setHasStarted] = useState(false);
  const [showTapOverlay, setShowTapOverlay] = useState(false);
  
  // Ref for input field to handle iOS focus
  const inputRef = useRef<HTMLInputElement>(null);
  const startButtonRef = useRef<HTMLButtonElement>(null);
  
  // Get global context functions
  const contextValue = useGlobalContext();
  const { addPoints, mathLevel } = contextValue || {};
  
  // Generate new math problem when component mounts
  useEffect(() => {
    const problem = generateMathProblem(mathLevel || 1);
    setCurrentProblem(problem);
    setInputValue('');
    setIsAnswered(false);
    setHasStarted(false);
  }, [mathLevel]);

  // Check for user interaction flag and focus input (iOS compatible)
  useEffect(() => {
    console.log('[MathTask] Checking for user interaction flags...');
    
    if (typeof window !== 'undefined') {
      // Check global flag first (immediate)
      if ((window as any).mathTaskShouldFocus) {
        console.log('[MathTask] 🎯 Global focus flag detected!');
        (window as any).mathTaskShouldFocus = false; // Clear it
        
        const focusInput = () => {
          if (inputRef.current) {
            console.log('[MathTask] 🚀 Attempting to focus input after user interaction');
            inputRef.current.focus();
            inputRef.current.click();
            setHasStarted(true);
            
            // Force iOS keyboard events
            const touchEvent = new TouchEvent('touchstart', { bubbles: true });
            inputRef.current.dispatchEvent(touchEvent);
            
            console.log('[MathTask] ✅ Input should be focused now');
          }
        };
        
        // Multiple attempts with different timings
        focusInput();
        setTimeout(focusInput, 50);
        setTimeout(focusInput, 150);
        return;
      }
      
      // Fallback: Check localStorage
      const shouldFocus = localStorage.getItem('shouldFocusInput');
      const interactionTime = localStorage.getItem('userInteractionTime');
      
      console.log('[MathTask] localStorage flags:', { shouldFocus, interactionTime });
      
      if (shouldFocus === 'true' && interactionTime) {
        const timeDiff = Date.now() - parseInt(interactionTime);
        console.log('[MathTask] Time difference:', timeDiff, 'ms');
        
        // Only use if interaction was recent (within 10 seconds)
        if (timeDiff < 10000) {
          console.log('[MathTask] 🎯 Recent user interaction detected, focusing input');
          
          // Clear the flags
          localStorage.removeItem('shouldFocusInput');
          localStorage.removeItem('userInteractionTime');
          
          // Focus input after user interaction
          const focusWithRetry = () => {
            if (inputRef.current) {
              console.log('[MathTask] 🚀 Focusing input...');
              inputRef.current.focus();
              inputRef.current.click();
              setHasStarted(true);
              
              // Try iOS-specific events
              const events = ['touchstart', 'touchend', 'mousedown', 'mouseup'];
              events.forEach(eventType => {
                const event = new Event(eventType, { bubbles: true });
                inputRef.current?.dispatchEvent(event);
              });
              
              console.log('[MathTask] ✅ Focus attempts completed');
            }
          };
          
          focusWithRetry();
          setTimeout(focusWithRetry, 100);
          setTimeout(focusWithRetry, 300);
        } else {
          console.log('[MathTask] ⏰ Interaction too old, cleaning up flags');
          localStorage.removeItem('shouldFocusInput');
          localStorage.removeItem('userInteractionTime');
        }
      } else {
        console.log('[MathTask] ❌ No valid focus flags found');
      }
    }
  }, [currentProblem]);

  // Auto-click invisible start button after component mounts (fallback)
  useEffect(() => {
    if (startButtonRef.current && !hasStarted) {
      const timer = setTimeout(() => {
        startButtonRef.current?.click();
      }, 300); // Increased delay to let user interaction check run first
      return () => clearTimeout(timer);
    }
  }, [currentProblem, hasStarted]);

  // iOS Detection and Overlay Logic
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    console.log('[MathTask] iOS Detection:', isIOS);
    
    if (isIOS) {
      // On iOS, show the overlay instead of trying automatic focus
      const shouldFocus = localStorage.getItem('shouldFocusInput') === 'true' || 
                         (window as any).mathTaskShouldFocus;
      
      if (shouldFocus) {
        console.log('[MathTask] 📱 iOS detected, showing tap overlay instead of auto-focus');
        setShowTapOverlay(true);
        
        // Clear flags
        localStorage.removeItem('shouldFocusInput');
        localStorage.removeItem('userInteractionTime');
        if ((window as any).mathTaskShouldFocus) {
          (window as any).mathTaskShouldFocus = false;
        }
      }
    }
  }, [currentProblem]);

  // Handle start (triggered by invisible button click) 
  const handleAutoStart = () => {
    setHasStarted(true);
    // Now focus input after real user interaction
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.click();
      }
    }, 50);
  };

  // Handle iOS focus when user taps the input
  const handleInputFocus = () => {
    if (inputRef.current && !isAnswered) {
      inputRef.current.focus();
    }
  };

  // Handle overlay tap for iOS focus
  const handleOverlayTap = () => {
    console.log('[MathTask] 📱 iOS overlay tapped, focusing input');
    setShowTapOverlay(false);
    if (inputRef.current) {
      inputRef.current.focus();
      setHasStarted(true);
    }
  };

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
      
      {/* Invisible auto-start button for iOS compatibility */}
      <button 
        ref={startButtonRef}
        onClick={handleAutoStart}
        style={{ 
          position: 'absolute',
          left: '-9999px',
          width: '1px',
          height: '1px',
          opacity: 0
        }}
        tabIndex={-1}
      >
        Start
      </button>
      
      {/* iOS Tap Overlay */}
      {showTapOverlay && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleOverlayTap}
        >
          <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-sm mx-4">
            <div className="text-xl font-semibold text-gray-800 mb-4">
              Tippen Sie, um Ihre Antwort einzugeben
            </div>
            <div className="text-gray-600 mb-6">
              Berühren Sie diesen Bereich, um das Eingabefeld zu aktivieren
            </div>
            <div className="text-sm text-blue-600 font-medium">
              → Tippen Sie hier ←
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-start md:justify-center">
        {/* Mobile spacing */}
        <div className="md:hidden" style={{ height: '20vh' }}></div>
        
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
            <div className="relative">
              <input
                ref={inputRef}
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value.replace(/\D/g, ''))}
                onKeyDown={handleKeyPress}
                onTouchStart={handleInputFocus}
                onMouseDown={handleInputFocus}
                onFocus={handleInputFocus}
                onClick={handleInputFocus}
                maxLength={3}
                placeholder="?"
                disabled={isAnswered}
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
                  ${isAnswered 
                    ? 'bg-gray-100 border-gray-300 text-gray-600' 
                    : 'bg-white border-blue-400 text-gray-800 focus:border-blue-500 focus:outline-none hover:border-blue-500 hover:shadow-md'
                  }`}
              />
              {!inputValue && !isAnswered && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-blue-600 font-medium whitespace-nowrap">
                  Tippen zum Eingeben
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!inputValue.trim() || isAnswered}
            className={`p-4 rounded-full transition-all duration-200 mb-6 md:mb-0
              ${!inputValue.trim() || isAnswered 
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
  );
}