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
  // Enhanced iOS detection including iPad Pro
  const isIOS = typeof window !== 'undefined' && 
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
     (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
  
  // iOS prefers PNG, others can use WebP
  const [useWebP, setUseWebP] = useState(!isIOS);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    console.log(`[OptimizedImage] Load error for Bild${faceNumber}, useWebP: ${useWebP}, isIOS: ${isIOS}`);
    
    if (useWebP && !isIOS) {
      // Try PNG version if WebP fails on non-iOS
      setUseWebP(false);
    } else {
      // PNG also failed or iOS error, call parent error handler
      setHasError(true);
      onError?.();
    }
  };

  const getImageSrc = () => {
    // iOS always uses PNG, others try WebP first
    if (isIOS || !useWebP || hasError) {
      return `/images/Bild${faceNumber}.png`;
    }
    
    return `/images/Bild${faceNumber}.webp`;
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