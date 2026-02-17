'use client';
import React, { useRef, useCallback, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { GlobalContext } from '../context/GlobalContext';

interface HandRecallProps {
  onComplete?: () => void;
}

const fingers = [1, 2, 3, 4, 5];

export default function HandRecall({ onComplete }: HandRecallProps) {
  const contextValue = useContext(GlobalContext);
  const { handData, addPoints, trackTaskAttempt, reduceMathLevelOnError, navigateToNextTask, handLevel } = contextValue || {};
  const { t } = useTranslation();
  const [clickedButton, setClickedButton] = useState<string | null>(null);

  // Use real data from HandTask
  const { hand, finger } = handData || { hand: '', finger: 0 };

  const handleRecall = useCallback((selectedHand: string, selectedFinger: number) => {
    if (!addPoints || !trackTaskAttempt || !reduceMathLevelOnError) {
      console.error('Missing context functions');
      return;
    }

    console.log(`HandRecall: Expected - ${hand}, finger ${finger}`);
    console.log(`HandRecall: Selected - ${selectedHand}, finger ${selectedFinger}`);
    
    // Set clicked button for styling
    const buttonKey = `${selectedHand}-${selectedFinger}`;
    setClickedButton(buttonKey);

    // Check if selection is correct
    const isCorrect = (selectedHand === hand) && (selectedFinger === finger);
    
    if (isCorrect) {
      // Add points (this will also track the attempt)
      const currentLevel = handLevel || 1;
      addPoints('handTask', true, currentLevel);
    } else {
      // Track false attempt
      trackTaskAttempt('handTask', false);
      reduceMathLevelOnError(); // Reduce MathLevel on error
    }

    // Visual feedback timing: scale animation for 200ms, then navigate
    setTimeout(() => {
      setClickedButton(null);
      navigateToNextTask && navigateToNextTask();
    }, 200);
  }, [hand, finger, addPoints, trackTaskAttempt, reduceMathLevelOnError, navigateToNextTask]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-8 bg-[#dfdfdfff]">
      <div className="bg-[#dfdfdfff] p-4 sm:p-8 max-w-lg w-full">
        <p className="text-base sm:text-lg font-semibold text-gray-800 text-center mb-6 sm:mb-8">
          {t('handRecall.instruction')}
        </p>
        
        <div className="flex justify-center gap-8 sm:gap-12">
          {/* Left Hand Section */}
          <div className="flex flex-col items-center">
            <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-4">
              {t('handRecall.leftHand')}
            </h3>
            <div className="flex flex-col gap-3">
              {fingers.map(f => {
                const buttonKey = `links-${f}`;
                const isClicked = clickedButton === buttonKey;
                return (
                  <button
                    key={buttonKey}
                    className={`relative w-14 h-12 rounded-lg font-semibold text-white transition-all duration-200 ${
                      isClicked 
                        ? 'bg-blue-700 scale-110' 
                        : 'bg-blue-500 hover:bg-blue-600 scale-100'
                    }`}
                    onClick={() => handleRecall('links', f)}
                  >
                    <span className={`text-lg ${isClicked ? 'text-gray-200' : 'text-white'}`}>
                      {f}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Right Hand Section */}
          <div className="flex flex-col items-center">
            <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-4">
              {t('handRecall.rightHand')}
            </h3>
            <div className="flex flex-col gap-3">
              {fingers.map(f => {
                const buttonKey = `rechts-${f}`;
                const isClicked = clickedButton === buttonKey;
                return (
                  <button
                    key={buttonKey}
                    className={`relative w-14 h-12 rounded-lg font-semibold text-white transition-colors ${
                      isClicked 
                        ? 'bg-blue-700 scale-110' 
                        : 'bg-blue-500 hover:bg-blue-600 scale-100'
                    }`}
                    onClick={() => handleRecall('rechts', f)}
                  >
                    <span className={`text-lg ${isClicked ? 'text-gray-200' : 'text-white'}`}>
                      {f}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}