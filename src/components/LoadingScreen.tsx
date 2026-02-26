'use client';
import React, { useState, useEffect, useContext } from 'react';
import { GlobalContext } from '../context/GlobalContext';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

export default function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
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
        setLoadingText('Context wird geladen...');

        // Schritt 1: Kurze Wartezeit für Context-Stabilisierung 
        await new Promise(resolve => setTimeout(resolve, 200));
        setLoadingText('Bilder werden vorgeladen...');

        // Schritt 2: Bilder preloaden
        await preloadImages();
        setLoadingText('Schriftarten werden geladen...');

        // Schritt 3: Fonts laden
        await preloadFonts();
        setLoadingText('App ist bereit!');

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
    // Existierende wichtige Bilder preloaden
    const imagePaths = [
      // Faden-Task Bilder existieren
      '/images/Faden1.webp',
      '/images/Faden2.webp', 
      '/images/Faden3.webp',
      '/images/Faden4.webp',
      '/images/Faden5.webp',
      '/images/Faden6.webp',
      // Einige wichtige Gesichter-Bilder
      '/images/Bild1.webp',
      '/images/Bild2.webp',
      '/images/Bild3.webp',
      '/images/Bild4.webp',
      '/images/Bild5.webp'
    ];

    console.log('[PRELOAD] Starting to preload', imagePaths.length, 'images...');

    const imagePromises = imagePaths.map(path => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve(); // Bei Fehlern trotzdem weitermachen
        img.src = path;
      });
    });

    await Promise.allSettled(imagePromises); // allSettled statt all für bessere Fehlerbehandlung
    console.log('[PRELOAD] Successfully preloaded', imagePaths.length + '/' + imagePaths.length, 'images');
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
      <div className="fixed inset-0 bg-[#dfdfdfff] flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#dfdfdfff] flex items-center justify-center z-50">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
    </div>
  );
}