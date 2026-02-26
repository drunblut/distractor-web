'use client';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdMenu } from 'react-icons/md';
import About from './About';
import Imprint from './Imprint';
import PrivacyPolicy from './PrivacyPolicy';
import TaskExamples from './TaskExamples';

interface StartScreenProps {
  onStart: () => void;
  onLanguagePress: () => void;
}

export default function StartScreen({ onStart, onLanguagePress }: StartScreenProps) {
  const { t } = useTranslation();
  const [menuVisible, setMenuVisible] = useState(false);
  const [aboutVisible, setAboutVisible] = useState(false);
  const [imprintVisible, setImprintVisible] = useState(false);
  const [privacyVisible, setPrivacyVisible] = useState(false);
  const [taskExamplesVisible, setTaskExamplesVisible] = useState(false);

  const handleStart = () => {
    console.log('Starting app...');
    onStart();
  };

  const handleMenuItemPress = (item: string) => {
    setMenuVisible(false);
    
    switch(item) {
      case 'language':
        onLanguagePress();
        break;
      case 'about':
        setAboutVisible(true);
        break;
      case 'tasks':
        setTaskExamplesVisible(true);
        break;
      case 'privacy':
        setPrivacyVisible(true);
        break;
      case 'imprint':
        setImprintVisible(true);
        break;
      default:
        console.log('Menu item pressed:', item);
        alert(`${item} - noch nicht implementiert`);
    }
  };

  const menuItems = [
    { key: 'about', label: t('menu.about') },
    { key: 'tasks', label: t('menu.tasks') },
    { key: 'language', label: t('menu.language') },
    { key: 'privacy', label: t('menu.privacy') },
    { key: 'imprint', label: t('menu.imprint') }
  ];

  return (
    <div className="relative flex flex-col min-h-screen bg-[#dfdfdfff] overflow-hidden">
      {/* Hamburger Menu Button */}
      <button 
        className="absolute top-5 right-5 z-50 p-3 hover:bg-black/5 rounded-lg transition-colors"
        onClick={() => setMenuVisible(true)}
      >
        <MdMenu size={42} color="#333" />
      </button>

      {/* Menu Modal */}
      {menuVisible && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 flex justify-end items-start pt-[90px] pr-5"
          onClick={() => setMenuVisible(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-lg min-w-[180px] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {menuItems.map((item, index) => (
              <button
                key={item.key}
                className={`w-full px-5 py-4 text-left text-[#333] hover:bg-gray-50 transition-colors ${
                  index < menuItems.length - 1 ? 'border-b border-gray-100' : ''
                }`}
                onClick={() => handleMenuItemPress(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* About Modal */}
      {aboutVisible && (
        <About onClose={() => setAboutVisible(false)} />
      )}

      {/* Task Examples Modal */}
      {taskExamplesVisible && (
        <TaskExamples onClose={() => setTaskExamplesVisible(false)} />
      )}

      {/* Privacy Modal */}
      {privacyVisible && (
        <PrivacyPolicy onClose={() => setPrivacyVisible(false)} />
      )}

      {/* Imprint Modal */}
      {imprintVisible && (
        <Imprint onClose={() => setImprintVisible(false)} />
      )}

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center flex-1 px-8">
        <h1 className="text-5xl font-bold text-[#333] mb-10 text-center">
          {t('startScreen.title')}
        </h1>
        
        <p className="text-lg text-[#666] text-center leading-7 mb-12 max-w-2xl px-5">
          {t('startScreen.description')}
        </p>
        
        <button 
          className="bg-[#007AFF] hover:bg-[#0056CC] px-10 py-4 rounded-[25px] shadow-lg transition-all duration-200 transform hover:scale-105"
          onClick={handleStart}
        >
          <span className="text-white text-xl font-bold">
            {t('startScreen.startButton')}
          </span>
        </button>
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-xs text-[#999] mb-1">
          {t('startScreen.version')}
        </p>
        <p className="text-xs text-[#999]">
          {t('startScreen.copyright')}
        </p>
      </div>
    </div>
  );
}