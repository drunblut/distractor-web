'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { MdMenu, MdLanguage } from 'react-icons/md';

interface MoodScreenProps {
  onContinue?: (data: { moodValue: number; mainSymptom: string; symptomIntensity: number }) => void;
  onLanguagePress?: () => void;
}

export default function MoodScreen({ onContinue, onLanguagePress }: MoodScreenProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1); // 1 = Mood, 2 = Symptom, 3 = Intensity
  const [moodValue, setMoodValue] = useState(5.0);
  const [sliderMoved, setSliderMoved] = useState(false);
  const [selectedSymptom, setSelectedSymptom] = useState('');
  const [symptomIntensity, setSymptomIntensity] = useState(5.0);
  const [intensitySliderMoved, setIntensitySliderMoved] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isIntensityDragging, setIsIntensityDragging] = useState(false);
  
  const sliderRef = useRef<HTMLDivElement>(null);
  const intensitySliderRef = useRef<HTMLDivElement>(null);
  const sliderWidth = 320; // Fixed width for web
  
  const updateSliderValue = useCallback((clientX: number) => {
    if (!sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, relativeX / sliderWidth));
    const newValue = Math.round((percentage * 10) * 10) / 10;
    
    setMoodValue(newValue);
    setSliderMoved(true);
  }, [sliderWidth]);

  const updateIntensitySliderValue = useCallback((clientX: number) => {
    if (!intensitySliderRef.current) return;
    
    const rect = intensitySliderRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, relativeX / sliderWidth));
    const newValue = Math.round((percentage * 10) * 10) / 10;
    
    setSymptomIntensity(newValue);
    setIntensitySliderMoved(true);
  }, [sliderWidth]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updateSliderValue(e.clientX);
  };

  const handleIntensityMouseDown = (e: React.MouseEvent) => {
    setIsIntensityDragging(true);
    updateIntensitySliderValue(e.clientX);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      updateSliderValue(e.clientX);
    }
    if (isIntensityDragging) {
      updateIntensitySliderValue(e.clientX);
    }
  }, [isDragging, isIntensityDragging, updateSliderValue, updateIntensitySliderValue]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsIntensityDragging(false);
  }, []);

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    const touch = e.touches[0];
    updateSliderValue(touch.clientX);
  };

  const handleIntensityTouchStart = (e: React.TouchEvent) => {
    setIsIntensityDragging(true);
    const touch = e.touches[0];
    updateIntensitySliderValue(touch.clientX);
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isDragging && e.touches[0]) {
      updateSliderValue(e.touches[0].clientX);
    }
    if (isIntensityDragging && e.touches[0]) {
      updateIntensitySliderValue(e.touches[0].clientX);
    }
  }, [isDragging, isIntensityDragging, updateSliderValue, updateIntensitySliderValue]);

  // Add event listeners for mouse/touch events
  React.useEffect(() => {
    if (isDragging || isIntensityDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, isIntensityDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  const handleContinue = () => {
    if (currentStep === 1 && sliderMoved) {
      console.log('[MoodScreen] Moving from step 1 to 2 (symptom selection)');
      setCurrentStep(2);
    } else if (currentStep === 2 && selectedSymptom) {
      console.log('[MoodScreen] Moving from step 2 to 3 (intensity rating)');
      setCurrentStep(3);
    } else if (currentStep === 3 && intensitySliderMoved && onContinue) {
      console.log('[MoodScreen] Completing mood assessment with data:', {
        moodValue,
        mainSymptom: selectedSymptom,
        symptomIntensity
      });
      onContinue({
        moodValue,
        mainSymptom: selectedSymptom,
        symptomIntensity
      });
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    }
  };

  const handleSymptomSelect = (symptomKey: string) => {
    setSelectedSymptom(symptomKey);
    console.log('[MoodScreen] Selected symptom:', symptomKey);
  };

  const handleLanguageSelect = () => {
    setMenuVisible(false);
    if (onLanguagePress) {
      onLanguagePress();
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center px-5 pt-12 pb-5">
        <div className="w-7 h-7" /> {/* Placeholder */}
        <button 
          onClick={() => setMenuVisible(true)}
          className="p-1"
        >
          <MdMenu size={28} color="#333" />
        </button>
      </div>

      {/* Menu Modal */}
      {menuVisible && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-end items-start pt-20 pr-5 z-50"
          onClick={() => setMenuVisible(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-lg min-w-[150px]"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="flex items-center px-4 py-3 w-full text-left hover:bg-gray-50"
              onClick={handleLanguageSelect}
            >
              <MdLanguage size={20} color="#333" />
              <span className="ml-3 text-base text-gray-800">{t('menu.language')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 -mt-12 w-full max-w-md mx-auto">
        {/* Step 1: Mood Rating */}
        {currentStep === 1 && (
          <>
            <h1 className="text-2xl font-bold text-center mb-15 text-gray-800">
              {t('moodScreen.title')}
            </h1>
            
            <div className="w-full flex flex-col items-center mb-15">
              {/* Slider Labels */}
              <div className="flex justify-between items-center mb-5" style={{ width: sliderWidth }}>
                <div className="text-base text-gray-600 font-medium text-left leading-5 whitespace-pre-line">
                  {t('moodScreen.labelLeft').split(' ').join('\n')}
                </div>
                <div className="text-base text-gray-600 font-medium text-right leading-5 whitespace-pre-line">
                  {t('moodScreen.labelRight').split(' ').join('\n')}
                </div>
              </div>
              
              {/* Slider (without scale marks) */}
              <div 
                ref={sliderRef}
                className="relative flex items-center justify-center cursor-pointer"
                style={{ width: sliderWidth, height: 60 }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
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
              
              {/* Value Indicator */}
              <div className="mt-5">
                <div className="text-lg font-bold text-blue-500">
                  {moodValue.toFixed(1)}/10.0
                </div>
              </div>
            </div>
          </>
        )}

        {/* Step 2: Symptom Selection */}
        {currentStep === 2 && (
          <>
            <h1 className="text-2xl font-bold text-center mb-8 text-gray-800">
              {t('moodScreen.symptomTitle')}
            </h1>
            
            <div className="w-full space-y-3 mb-8 max-h-96 overflow-y-auto">
              {[
                'anxietyPanic', 'depression', 'flashback', 'rumination',
                'pain', 'anger', 'obsessiveThoughts', 'alcoholCraving',
                'drugCraving', 'eating', 'nicotineCraving', 'otherSymptom'
              ].map((symptomKey) => (
                <button
                  key={symptomKey}
                  onClick={() => handleSymptomSelect(symptomKey)}
                  className={`w-full p-4 rounded-lg text-left border-2 transition-colors ${
                    selectedSymptom === symptomKey
                      ? 'bg-blue-100 border-blue-500 text-blue-800'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {t(`moodScreen.symptoms.${symptomKey}`)}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Step 3: Symptom Intensity Rating */}
        {currentStep === 3 && (
          <>
            <h1 className="text-2xl font-bold text-center mb-15 text-gray-800">
              {t('moodScreen.intensityTitle', { symptom: t(`moodScreen.symptoms.${selectedSymptom}`) })}
            </h1>
            
            <div className="w-full flex flex-col items-center mb-15">
              {/* Intensity Slider Labels */}
              <div className="flex justify-between items-center mb-5" style={{ width: sliderWidth }}>
                <div className="text-base text-gray-600 font-medium text-left leading-5">
                  {t('moodScreen.intensityLabelLeft')}
                </div>
                <div className="text-base text-gray-600 font-medium text-right leading-5">
                  {t('moodScreen.intensityLabelRight')}
                </div>
              </div>
              
              {/* Intensity Slider (without scale marks) */}
              <div 
                ref={intensitySliderRef}
                className="relative flex items-center justify-center cursor-pointer"
                style={{ width: sliderWidth, height: 60 }}
                onMouseDown={handleIntensityMouseDown}
                onTouchStart={handleIntensityTouchStart}
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
              
              {/* Value Indicator */}
              <div className="mt-5">
                <div className="text-lg font-bold text-blue-500">
                  {symptomIntensity.toFixed(1)}/10.0
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* Navigation Buttons */}
        <div className="flex gap-4">
          {/* Back Button (only show after step 1) */}
          {currentStep > 1 && (
            <button
              className="px-6 py-4 rounded-full text-lg font-bold bg-gray-400 text-white hover:bg-gray-500 shadow-lg transition-colors"
              onClick={handleBack}
            >
              {t('moodScreen.backButton')}
            </button>
          )}
          
          {/* Continue Button */}
          <button
            className={`px-10 py-4 rounded-full text-lg font-bold shadow-lg transition-colors ${
              (currentStep === 1 && sliderMoved) ||
              (currentStep === 2 && selectedSymptom) ||
              (currentStep === 3 && intensitySliderMoved)
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-400 text-gray-600 cursor-not-allowed'
            }`}
            onClick={handleContinue}
            disabled={
              (currentStep === 1 && !sliderMoved) ||
              (currentStep === 2 && !selectedSymptom) ||
              (currentStep === 3 && !intensitySliderMoved)
            }
          >
            {t('moodScreen.continueButton')}
          </button>
        </div>
        
        {/* Instruction Text */}
        <div 
          className={`text-sm text-gray-600 text-center mt-5 italic transition-opacity ${
            (currentStep === 1 && sliderMoved) ||
            (currentStep === 2 && selectedSymptom) ||
            (currentStep === 3 && intensitySliderMoved)
              ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {currentStep === 1 ? t('moodScreen.instruction') : ''}
        </div>
      </div>
    </div>
  );
}