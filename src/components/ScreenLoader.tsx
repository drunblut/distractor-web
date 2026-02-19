'use client';
import React, { useState, useEffect } from 'react';

interface ScreenLoaderProps {
  children: React.ReactNode;
  imageUrls?: string[];
  fontsToLoad?: string[];
  minLoadTime?: number;
  onLoadComplete?: () => void;
}

export default function ScreenLoader({
  children,
  imageUrls = [],
  fontsToLoad = [],
  minLoadTime = 500,
  onLoadComplete
}: ScreenLoaderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    let imagesLoaded = 0;
    let fontsLoaded = false;

    // Funktion um zu prüfen ob alles geladen ist
    const checkAllLoaded = () => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadTime - elapsedTime);

      if (imagesLoaded >= imageUrls.length && fontsLoaded) {
        setTimeout(() => {
          setIsLoading(false);
          onLoadComplete?.();
        }, remainingTime);
      }
    };

    // Bilder laden
    if (imageUrls.length > 0) {
      imageUrls.forEach((url) => {
        const img = new Image();
        img.onload = () => {
          imagesLoaded++;
          setLoadedImages(imagesLoaded);
          checkAllLoaded();
        };
        img.onerror = () => {
          // Bei Fehler trotzdem als "geladen" zählen
          imagesLoaded++;
          setLoadedImages(imagesLoaded);
          checkAllLoaded();
        };
        img.src = url;
      });
    } else {
      imagesLoaded = 0;
    }

    // Fonts laden
    const loadFonts = async () => {
      try {
        if (fontsToLoad.length > 0) {
          await Promise.all(
            fontsToLoad.map(font => document.fonts.load(font))
          );
        }
        fontsLoaded = true;
        checkAllLoaded();
      } catch (error) {
        console.warn('Font loading failed:', error);
        fontsLoaded = true;
        checkAllLoaded();
      }
    };

    loadFonts();

    // Falls keine Bilder und Fonts zu laden sind
    if (imageUrls.length === 0 && fontsToLoad.length === 0) {
      setTimeout(() => {
        setIsLoading(false);
        onLoadComplete?.();
      }, minLoadTime);
    }

  }, [imageUrls, fontsToLoad, minLoadTime, onLoadComplete]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#dfdfdfff] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
          {imageUrls.length > 0 && (
            <p className="text-sm text-gray-500">
              Bilder laden... ({loadedImages}/{imageUrls.length})
            </p>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}