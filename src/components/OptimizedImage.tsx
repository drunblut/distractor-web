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
  const [useWebP, setUseWebP] = useState(true);

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
    if (useWebP) {
      // Try WebP first (best compression)
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
      loading="lazy" // Native lazy loading for better performance
    />
  );
};

export default OptimizedImage;