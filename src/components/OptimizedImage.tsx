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
  
  // iOS prefers PNG, others can use WebP
  const [useWebP, setUseWebP] = useState(!isIOS);
  const [hasError, setHasError] = useState(false);
  const [loadStatus, setLoadStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  const handleError = () => {
    setLoadStatus('error');
    
    if (useWebP && !isIOS) {
      // Try PNG version if WebP fails on non-iOS
      setUseWebP(false);
      setLoadStatus('loading');
    } else {
      // PNG also failed or iOS error, call parent error handler
      setHasError(true);
      onError?.();
    }
  };

  const handleLoad = () => {
    setLoadStatus('loaded');
    onLoad?.();
  };

  const getImageSrc = () => {
    // iOS always uses PNG, others try WebP first
    return (isIOS || !useWebP || hasError) ? 
      `/images/Bild${faceNumber}.png` : 
      `/images/Bild${faceNumber}.webp`;
  };

  return (
    <div className="relative w-full h-full">
      <img
        src={getImageSrc()}
        alt={alt}
        className={className}
        onLoad={handleLoad}
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
      
      {/* iOS Debug Overlay - Only show on iOS */}
      {isIOS && (
        <div className="absolute top-0 left-0 bg-black bg-opacity-75 text-white text-xs p-1 rounded max-w-full">
          <div>Face: {faceNumber}</div>
          <div>iOS: {isIOS ? 'YES' : 'NO'}</div>
          <div>Format: {(isIOS || !useWebP) ? 'PNG' : 'WebP'}</div>
          <div>Status: {loadStatus}</div>
          <div>Error: {hasError ? 'YES' : 'NO'}</div>
          <div className="text-xs opacity-75">
            UA: {typeof window !== 'undefined' ? navigator.userAgent.substring(0, 40) : 'N/A'}...
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;