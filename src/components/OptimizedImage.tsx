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
  // Check if iOS device
  const isIOS = typeof window !== 'undefined' && 
    /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  // Use PNG by default on iOS to avoid WebP issues
  const [useWebP, setUseWebP] = useState(!isIOS);

  const handleError = () => {
    if (useWebP) {
      // Try PNG version if WebP fails
      setUseWebP(false);
    } else {
      // PNG also failed, call parent error handler
      onError?.();
    }
  };

  const getImageSrc = () => {
    if (useWebP && !isIOS) {
      // Try WebP first (best compression) - but not on iOS
      return `/images/Bild${faceNumber}.webp`;
    }
    
    // Use optimized PNG (now in main images folder)
    return `/images/Bild${faceNumber}.png`;
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