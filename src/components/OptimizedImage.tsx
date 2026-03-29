import React, { useState } from 'react';

interface OptimizedImageProps {
  faceNumber: number;
  alt: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
  'data-face'?: number;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  faceNumber,
  alt,
  className = '',
  onLoad,
  onError,
  'data-face': dataFace,
}) => {
  // Enhanced iOS detection including iPad Pro - fixed detection
  const isIOS = typeof window !== 'undefined' && (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    // Only detect iPad Pro with touch support, not all MacIntel devices
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1 && 'ontouchstart' in window)
  );
  
  // Debug info for iOS testing
  if (typeof window !== 'undefined' && isIOS) {
    console.log(`[OptimizedImage DEBUG] iOS Device - Face${faceNumber}:`, {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      maxTouchPoints: navigator.maxTouchPoints,
      hasTouch: 'ontouchstart' in window,
      isIOS: isIOS
    });
  }
  
  // iOS prefers PNG, others can use WebP
  const [useWebP, setUseWebP] = useState(!isIOS);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    console.log(`[OptimizedImage ERROR] Face${faceNumber} load failed:`, {
      useWebP: useWebP,
      isIOS: isIOS,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'N/A',
      currentSrc: getImageSrc()
    });
    
    if (useWebP && !isIOS) {
      // Try PNG version if WebP fails on non-iOS
      console.log(`[OptimizedImage] Falling back to PNG for Face${faceNumber}`);
      setUseWebP(false);
    } else {
      // PNG also failed or iOS error, call parent error handler
      console.log(`[OptimizedImage] PNG failed for Face${faceNumber} - setting hasError`);
      setHasError(true);
      onError?.();
    }
  };

  const getImageSrc = () => {
    // iOS always uses PNG, others try WebP first
    const src = (isIOS || !useWebP || hasError) ? 
      `/images/Bild${faceNumber}.png` : 
      `/images/Bild${faceNumber}.webp`;
    
    if (isIOS) {
      console.log(`[OptimizedImage] iOS - Loading Face${faceNumber}: ${src}`);
    }
    
    return src;
  };
  };

  return (
    <img
      src={getImageSrc()}
      alt={alt}
      className={className}
      onLoad={onLoad}
      onError={handleError}
      data-face={dataFace}
      // No lazy loading to prevent flickering
      decoding="sync"
      style={{
        imageRendering: 'auto',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        display: 'block' // Prevent layout shifts
      }}
    />
  );
};

export default OptimizedImage;