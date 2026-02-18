'use client';
import React, { useState, useEffect, useContext } from 'react';
import { GlobalContext } from '../context/GlobalContext';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

export default function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initialisiere App...');
  const context = useContext(GlobalContext);

  useEffect(() => {
    if (!context) {
      setLoadingText('GlobalContext wird geladen...');
      return;
    }

    const initializeApp = async () => {
      try {
        setLoadingText('GlobalContext geladen...');
        setLoadingProgress(30);

        // Schritt 1: Kurze Wartezeit für Context-Stabilisierung 
        await new Promise(resolve => setTimeout(resolve, 200));
        setLoadingText('Bilder werden vorgeladen...');
        setLoadingProgress(50);

        // Schritt 2: Bilder preloaden
        await preloadImages();
        setLoadingText('Schriftarten werden geladen...');
        setLoadingProgress(80);

        // Schritt 3: Fonts laden
        await preloadFonts();
        setLoadingText('App ist bereit!');
        setLoadingProgress(100);

        // Kurze Pause bevor die App startet
        await new Promise(resolve => setTimeout(resolve, 300));
        
        onLoadingComplete();
      } catch (error) {
        console.warn('Preloading Warnung:', error);
        // Auch bei Fehlern die App starten (fallback nach 2 Sekunden)
        setTimeout(() => {
          onLoadingComplete();
        }, 2000);
      }
    };

    initializeApp();
  }, [context, onLoadingComplete]);

  const preloadImages = async () => {
    // Wichtigste Pie-Task Bilder preloaden
    const imagePaths = [
      '/images/pie1.png',
      '/images/pie2.png', 
      '/images/pie3.png',
      '/images/pie4.png',
      '/images/chess1.png',
      '/images/chess2.png'
    ];

    const imagePromises = imagePaths.map(path => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve(); // Bei Fehlern trotzdem weitermachen
        img.src = path;
      });
    });

    await Promise.allSettled(imagePromises); // allSettled statt all für bessere Fehlerbehandlung
  };

  const preloadFonts = async () => {
    if (document.fonts) {
      await document.fonts.ready;
    }
    return Promise.resolve();
  };

  // Wenn Context noch nicht geladen, einfache Anzeige
  if (!context) {
    return (
      <div className="fixed inset-0 bg-[#dfdfdfff] flex flex-col items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-lg text-gray-600">GlobalContext wird geladen...</p>
          <p className="text-sm text-gray-400 mt-2">Bitte warten...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#dfdfdfff] flex flex-col items-center justify-center z-50">
      <div className="text-center max-w-sm">
        {/* Logo/Title */}
        <h1 className="text-2xl font-bold text-gray-800 mb-8">
          Distractor Web
        </h1>

        {/* Loading Animation - ähnlich wie Desktop-Version */}
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-6 mx-auto"></div>

        {/* Progress Bar - ähnlich wie Desktop-Version */}
        <div className="w-64 bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${loadingProgress}%` }}
          ></div>
        </div>

        {/* Loading Text */}
        <p className="text-lg text-gray-600 mb-2">
          {loadingText}
        </p>

        {/* Progress Percentage */}
        <p className="text-sm text-gray-400">
          {loadingProgress}%
        </p>
      </div>
    </div>
  );
}