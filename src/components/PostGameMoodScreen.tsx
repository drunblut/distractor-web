'use client';

import React, { useState, useRef, useCallback, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MdChevronRight } from 'react-icons/md';
import { GlobalContext } from '../context/GlobalContext';

interface PostGameMoodScreenProps {
  onComplete?: (data: { moodNachher: number; symptomIntensityNachher: number }) => void;
}

export default function PostGameMoodScreen({ onComplete }: PostGameMoodScreenProps) {
  const { t } = useTranslation();
  const contextValue = useContext(GlobalContext);
  const { navigateToNextTask } = contextValue || {};
  
  // Safety check for context
  if (!contextValue) {
    console.error('[PostGameMoodScreen] GlobalContext is undefined');
    return null;
  }

  const [currentStep, setCurrentStep] = useState(1); // 1 = Mood, 2 = Symptom Intensity
  const [moodValue, setMoodValue] = useState(5.0);
  const [sliderMoved, setSliderMoved] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [symptomIntensity, setSymptomIntensity] = useState(5.0);
  const [intensitySliderMoved, setIntensitySliderMoved] = useState(false);
  const [isIntensityDragging, setIsIntensityDragging] = useState(false);
  
  const sliderRef = useRef<HTMLDivElement>(null);
  const intensitySliderRef = useRef<HTMLDivElement>(null);
  const sliderWidth = 320; // Fixed width for web

  // Get initial mood data (selected symptom) from session
  const [selectedSymptom, setSelectedSymptom] = useState<string>('');
  
  useEffect(() => {
    // Get saved session data to retrieve the initially selected symptom
    const savedSession = localStorage.getItem('currentSession');
    if (savedSession) {
      try {
        const sessionData = JSON.parse(savedSession);
        if (sessionData.symptom) {
          setSelectedSymptom(sessionData.symptom);
          console.log('[PostGameMoodScreen] Using saved symptom:', sessionData.symptom);
        }
      } catch (error) {
        console.error('[PostGameMoodScreen] Error parsing session data:', error);
      }
    }
  }, []);

  // Mood slider handlers
  const handleMoodSliderStart = useCallback((clientX: number) => {
    if (!sliderRef.current) return;
    setIsDragging(true);
    updateMoodSliderValue(clientX);
    setSliderMoved(true);
  }, []);

  const handleMoodSliderMove = useCallback((clientX: number) => {
    if (isDragging) {
      updateMoodSliderValue(clientX);
    }
  }, [isDragging]);

  const handleMoodSliderEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const updateMoodSliderValue = useCallback((clientX: number) => {
    if (!sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, sliderWidth));
    const percentage = x / sliderWidth;
    const value = 0 + (percentage * 10);
    setMoodValue(Number(value.toFixed(1)));
  }, []);

  // Symptom intensity slider handlers 
  const handleIntensitySliderStart = useCallback((clientX: number) => {
    if (!intensitySliderRef.current) return;
    setIsIntensityDragging(true);
    updateIntensitySliderValue(clientX);
    setIntensitySliderMoved(true);
  }, []);

  const handleIntensitySliderMove = useCallback((clientX: number) => {
    if (isIntensityDragging) {
      updateIntensitySliderValue(clientX);
    }
  }, [isIntensityDragging]);

  const handleIntensitySliderEnd = useCallback(() => {
    setIsIntensityDragging(false);
  }, []);

  const updateIntensitySliderValue = useCallback((clientX: number) => {
    if (!intensitySliderRef.current) return;
    
    const rect = intensitySliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, sliderWidth));
    const percentage = x / sliderWidth;
    const value = 0 + (percentage * 10);
    setSymptomIntensity(Number(value.toFixed(1)));
  }, []);

  // Mouse events for mood slider
  const handleMoodMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleMoodSliderStart(e.clientX);
  };

  useEffect(() => {
    const handleMoodMouseMove = (e: MouseEvent) => {
      handleMoodSliderMove(e.clientX);
    };

    const handleMoodMouseUp = () => {
      handleMoodSliderEnd();
    };

    const handleMoodTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        handleMoodSliderMove(e.touches[0].clientX);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMoodMouseMove);
      window.addEventListener('mouseup', handleMoodMouseUp);
      window.addEventListener('touchmove', handleMoodTouchMove);
      window.addEventListener('touchend', handleMoodMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMoodMouseMove);
      window.removeEventListener('mouseup', handleMoodMouseUp);
      window.removeEventListener('touchmove', handleMoodTouchMove);
      window.removeEventListener('touchend', handleMoodMouseUp);
    };
  }, [isDragging, handleMoodSliderMove, handleMoodSliderEnd]);

  // Mouse events for intensity slider
  const handleIntensityMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleIntensitySliderStart(e.clientX);
  };

  useEffect(() => {
    const handleIntensityMouseMove = (e: MouseEvent) => {
      handleIntensitySliderMove(e.clientX);
    };

    const handleIntensityMouseUp = () => {
      handleIntensitySliderEnd();
    };

    const handleIntensityTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        handleIntensitySliderMove(e.touches[0].clientX);
      }
    };

    if (isIntensityDragging) {
      window.addEventListener('mousemove', handleIntensityMouseMove);
      window.addEventListener('mouseup', handleIntensityMouseUp);
      window.addEventListener('touchmove', handleIntensityTouchMove);
      window.addEventListener('touchend', handleIntensityMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleIntensityMouseMove);
      window.removeEventListener('mouseup', handleIntensityMouseUp);
      window.removeEventListener('touchmove', handleIntensityTouchMove);
      window.removeEventListener('touchend', handleIntensityMouseUp);
    };
  }, [isIntensityDragging, handleIntensitySliderMove, handleIntensitySliderEnd]);

  // Navigation handlers
  const handleMoodContinue = () => {
    if (!sliderMoved) return;
    console.log('[PostGameMoodScreen] Mood after:', moodValue);
    setCurrentStep(2);
  };

  const handleIntensityContinue = () => {
    if (!intensitySliderMoved) return;
    
    console.log('[PostGameMoodScreen] Final mood:', moodValue, 'Symptom:', selectedSymptom, 'Intensity after:', symptomIntensity);
    
    // Save mood_nachher and hauptsymptom_nachher to session
    const savedSession = localStorage.getItem('currentSession');
    if (savedSession) {
      try {
        const sessionData = JSON.parse(savedSession);
        sessionData.mood_nachher = moodValue;
        sessionData.hauptsymptom_nachher = symptomIntensity;
        localStorage.setItem('currentSession', JSON.stringify(sessionData));
        console.log('[PostGameMoodScreen] Saved final mood data to session');
        
        // Now save ALL session data to database (final complete save)
        if (sessionData.id) {
          saveFinalSessionToDatabase(sessionData);
        }
      } catch (error) {
        console.error('[PostGameMoodScreen] Error saving final mood data:', error);
      }
    }

    // Call onComplete callback if provided
    if (onComplete) {
      onComplete({
        moodNachher: moodValue,
        symptomIntensityNachher: symptomIntensity
      });
      return; // Exit early if onComplete is provided
    }

    // Navigate to results (fallback for other implementations)
    if (navigateToNextTask) {
      navigateToNextTask();
    }
  };
  
  // Function to save complete session data to database (final save after all data collected)
  const saveFinalSessionToDatabase = async (sessionData: any) => {
    try {
      console.log('[PostGameMoodScreen] Saving complete session to database:', sessionData);
      
      // Prepare mood and symptom data
      const moodData = {
        mood_vorher: sessionData.mood_vorher,
        mood_nachher: sessionData.mood_nachher,
        hauptsymptom: sessionData.symptom,
        hauptsymptom_vorher: sessionData.symptom_intensity,
        hauptsymptom_nachher: sessionData.hauptsymptom_nachher
      };
      
      // Prepare task stats data
      const taskStats = sessionData.taskStats || {};
      const totalPoints = sessionData.totalPoints || 0;
      
      // Calculate totals from task stats
      const getTaskData = (taskKey: string) => {
        const stats = taskStats[taskKey];
        if (stats && stats.attempts > 0) {
          return {
            attempts: stats.attempts,
            correct: stats.correct,
            accuracy: (stats.correct / stats.attempts) * 100
          };
        }
        return { attempts: 0, correct: 0, accuracy: 0.0 };
      };
      
      const totalAttempts = Object.values(taskStats).reduce((sum: number, task: any) => sum + (task.attempts || 0), 0);
      const totalCorrect = Object.values(taskStats).reduce((sum: number, task: any) => sum + (task.correct || 0), 0);
      const totalAccuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;
      
      // Prepare complete results data
      const resultsData = {
        // Mood and symptom data
        ...moodData,
        
        // Total stats
        total_attempts: totalAttempts,
        total_correct: totalCorrect,
        total_accuracy: totalAccuracy,
        total_points: totalPoints,
        
        // Individual task data
        ...Object.fromEntries(['math', 'pie', 'chess', 'faden', 'hand', 'face1', 'face2'].map(task => {
          const data = getTaskData(task + 'Task');
          return [
            [`${task}_attempts`, data.attempts],
            [`${task}_correct`, data.correct],
            [`${task}_accuracy`, data.accuracy]
          ];
        }).flat()),
        
        // Phase points (use actual phase points instead of defaults)
        phase_1_points: sessionData.phasePoints?.[1] || 0,
        phase_2_points: sessionData.phasePoints?.[2] || 0, 
        phase_3_points: sessionData.phasePoints?.[3] || 0
      };
      
      // Save complete results to database
      const response = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_final_results',
          sessionId: sessionData.id,
          results: resultsData
        })
      });
      
      const result = await response.json();
      if (response.ok && result.success) {
        console.log('[PostGameMoodScreen] Successfully saved complete session to database');
        // Clear localStorage after successful save
        localStorage.removeItem('currentSession');
      } else {
        console.error('[PostGameMoodScreen] Failed to save complete session:', result.error);
      }
    } catch (error) {
      console.error('[PostGameMoodScreen] Error saving complete session to database:', error);
    }
  };
  
  // Function to update final mood data in database (legacy - now replaced by saveFinalSessionToDatabase)
  const updateFinalMoodData = async (sessionId: number, moodNachher: number, symptomNachher: number) => {
    try {
      console.log('[PostGameMoodScreen] Updating database with final mood data:', { sessionId, moodNachher, symptomNachher });
      
      const response = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_mood_symptoms',
          id: sessionId,
          moodNachher: moodNachher,
          symptomNachher: symptomNachher
        })
      });
      
      const result = await response.json();
      if (response.ok && result.success) {
        console.log('[PostGameMoodScreen] Successfully updated final mood data in database');
      } else {
        console.error('[PostGameMoodScreen] Failed to update final mood data:', result.error);
      }
    } catch (error) {
      console.error('[PostGameMoodScreen] Error updating final mood data:', error);
    }
  };

  // Render mood assessment step
  if (currentStep === 1) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-8 bg-[#dfdfdfff]">
        <div className="bg-[#dfdfdfff] p-4 sm:p-8 max-w-md w-full">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center mb-2">
            {t('postGameMood.title')}
          </h2>
          
          <p className="text-base sm:text-lg text-gray-700 text-center mb-8">
            {t('postGameMood.moodQuestion')}
          </p>

          {/* Mood Slider */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-5" style={{ width: sliderWidth }}>
              <div className="text-sm text-gray-600 font-medium text-left leading-5 whitespace-pre-line">
                {t('moodScreen.labelLeft').split(' ').join('\n')}
              </div>
              <div className="text-sm text-gray-600 font-medium text-right leading-5 whitespace-pre-line">
                {t('moodScreen.labelRight').split(' ').join('\n')}
              </div>
            </div>
            <div className="relative w-full flex justify-center">
              <div
                ref={sliderRef}
                className="relative flex items-center justify-center cursor-pointer"
                style={{ width: sliderWidth, height: 60 }}
                onMouseDown={handleMoodMouseDown}
                onTouchStart={(e) => {
                  const touch = e.touches[0];
                  handleMoodSliderStart(touch.clientX);
                }}
              >
                {/* Track */}
                <div 
                  className="absolute bg-gray-300 border border-gray-400 rounded-md"
                  style={{ width: '100%', height: 12 }}
                />
                
                {/* Thumb */}
                <div 
                  className="absolute w-7 h-7 bg-blue-500 border-2 border-white rounded-full shadow-lg"
                  style={{ 
                    left: (moodValue / 10) * (sliderWidth - 30) + 15 - 15
                  }}
                />
              </div>
            </div>
            
            {/* Value Display */}
            <div className="text-center mt-5">
              <div className="text-lg font-bold text-blue-500">
                {moodValue.toFixed(1)}/10.0
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <div className="flex justify-center">
            <button
              onClick={handleMoodContinue}
              disabled={!sliderMoved}
              className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-200 ${
                sliderMoved
                  ? 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <span>{t('postGameMood.continue')}</span>
              <MdChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render symptom intensity assessment step
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-8 bg-[#dfdfdfff]">
      <div className="bg-[#dfdfdfff] p-4 sm:p-8 max-w-md w-full">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center mb-2">
          {t('postGameMood.symptomTitle')}
        </h2>
        
        <p className="text-base sm:text-lg text-gray-700 text-center mb-8">
          {t('postGameMood.symptomQuestion', { symptom: selectedSymptom || 'Hauptsymptom' })}
        </p>

        {/* Intensity Slider */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-5" style={{ width: sliderWidth }}>
            <div className="text-sm text-gray-600 font-medium text-left leading-5 whitespace-pre-line">
              {t('postGameMood.veryLight').split(' ').join('\n')}
            </div>
            <div className="text-sm text-gray-600 font-medium text-right leading-5 whitespace-pre-line">
              {t('postGameMood.veryStrong').split(' ').join('\n')}
            </div>
          </div>
          <div className="relative w-full flex justify-center">
            <div
              ref={intensitySliderRef}
              className="relative flex items-center justify-center cursor-pointer"
              style={{ width: sliderWidth, height: 60 }}
              onMouseDown={handleIntensityMouseDown}
              onTouchStart={(e) => {
                const touch = e.touches[0];
                handleIntensitySliderStart(touch.clientX);
              }}
            >
              {/* Track */}
              <div 
                className="absolute bg-gray-300 border border-gray-400 rounded-md"
                style={{ width: '100%', height: 12 }}
              />
              
              {/* Thumb */}
              <div 
                className="absolute w-7 h-7 bg-blue-500 border-2 border-white rounded-full shadow-lg"
                style={{ 
                  left: (symptomIntensity / 10) * (sliderWidth - 30) + 15 - 15
                }}
              />
            </div>
          </div>
          
          {/* Value Display */}
          <div className="text-center mt-5">
            <div className="text-lg font-bold text-blue-500">
              {symptomIntensity.toFixed(1)}/10.0
            </div>
          </div>
        </div>

        {/* Complete Button */}
        <div className="flex justify-center">
          <button
            onClick={handleIntensityContinue}
            disabled={!intensitySliderMoved}
            className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-200 ${
              intensitySliderMoved
              ? 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 shadow-lg hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <span>{t('postGameMood.complete')}</span>
            <MdChevronRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}