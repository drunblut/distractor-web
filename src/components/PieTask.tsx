'use client';
import React, { useState, useEffect, useRef, useCallback, useMemo, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { MdChevronRight } from 'react-icons/md';
import { GlobalContext } from '../context/GlobalContext';

const generateRandomRotation = () => Math.random() * (30 - 10) + 10;

// Configuration constants - responsive sizing
const getPieSize = () => {
  if (typeof window !== 'undefined') {
    const screenWidth = window.innerWidth;
    
    // Mobile: 90% der Bildschirmbreite für optimale Sichtbarkeit
    if (screenWidth < 768) {
      return Math.round(screenWidth * 0.9);
    }
    
    // Tablet und Desktop: maximal 400px
    return 400;
  }
  return 400; // Default for SSR
};

const PIE_SEGMENTS = 9;

// Color constants from the original
const Colors = {
  pieRed: '#ff4444',
  pieBlue: '#4285f4',
  textLight: '#777',
};

interface PieTaskProps {
  onComplete?: () => void;
  onNext?: () => void;
  onDataUpdate?: (rotation: number, targetSegments: number[]) => void;
}

export default function PieTask({ onComplete, onNext, onDataUpdate }: PieTaskProps) {
  const { t } = useTranslation();
  const contextValue = useContext(GlobalContext);
  const { 
    pieLevel,
    setPieRotation,
    setPieTargetSegments 
  } = contextValue || {};
  
  // Safety check for context
  if (!contextValue) {
    console.error('[PieTask] GlobalContext is undefined');
    return null;
  }
  
  // Use pieLevel from GlobalContext, fallback to 1
  
  // Responsive pie size - initialize properly
  const [pieSize, setPieSize] = useState(() => getPieSize());
  const center = useMemo(() => pieSize / 2, [pieSize]);
  const radius = useMemo(() => pieSize / 2 - 20, [pieSize]);

  // Update sizes on window resize - only update if size actually changed
  useEffect(() => {
    const updateSize = () => {
      const newSize = getPieSize();
      // Only update state if the size has actually changed
      setPieSize(currentSize => {
        if (currentSize !== newSize) {
          console.log('[PieTask] Pie size changed from', currentSize, 'to', newSize);
          return newSize;
        }
        return currentSize;
      });
    };

    if (typeof window !== 'undefined') {
      // Don't call updateSize() immediately - initial size is already set correctly
      window.addEventListener('resize', updateSize);
      return () => window.removeEventListener('resize', updateSize);
    }
  }, []);

  // Rotation - computed once, never changes
  const rotationRef = useRef(generateRandomRotation());

  // Generate target segments based on level
  const generateTargetSegments = useCallback((level: number) => {
    const targets: number[] = [];
    const numTargets = Math.min(level, 4);
    while (targets.length < numTargets) {
      const newTarget = Math.floor(Math.random() * PIE_SEGMENTS);
      if (!targets.includes(newTarget)) {
        targets.push(newTarget);
      }
    }
    return targets;
  }, []);

  // Use cached target segments - regenerate when level changes
  const targetSegments = useMemo(() => 
    generateTargetSegments(pieLevel || 1), 
    [pieLevel] // Only depend on pieLevel, not the function itself
  );

  // Send initial data to parent immediately when requested
  const [dataInitialized, setDataInitialized] = useState(false);
  
  useEffect(() => {
    console.log('[PieTask DEBUG] Saving rotation data:', rotationRef.current);
    console.log('[PieTask DEBUG] Saving target segments:', targetSegments);
    
    // Save rotation and target segments to GlobalContext
    if (setPieRotation && setPieTargetSegments) {
      setPieRotation(rotationRef.current);
      setPieTargetSegments(targetSegments);
      console.log('[PieTask DEBUG] Successfully saved to GlobalContext');
    } else {
      console.warn('[PieTask DEBUG] Missing setPieRotation or setPieTargetSegments functions');
    }
    
    // ALWAYS call onDataUpdate to ensure GlobalContext gets the data
    if (onDataUpdate) {
      onDataUpdate(rotationRef.current, targetSegments);
      console.log('[PieTask DEBUG] Called onDataUpdate callback with rotation:', rotationRef.current);
    } else {
      console.warn('[PieTask DEBUG] No onDataUpdate callback provided');
    }
    
    setDataInitialized(true);
  }, [onDataUpdate, setPieRotation, setPieTargetSegments, targetSegments]);

  // Navigate to next task using the new navigation system
  const handleNavigateToNext = () => {
    console.log('[PieTask] handleNavigateToNext called');
    console.log('[PieTask] Final rotation before navigation:', rotationRef.current);
    console.log('[PieTask] Final target segments before navigation:', targetSegments);
    
    // Ensure data is saved before navigation
    if (setPieRotation && setPieTargetSegments) {
      setPieRotation(rotationRef.current);
      setPieTargetSegments(targetSegments);
      console.log('[PieTask] Re-saved data before navigation');
    }
    
    console.log('[PieTask] onNext function available:', !!onNext);
    if (onNext) {
      console.log('[PieTask] Calling onNext function');
      onNext();
    } else {
      console.error('[PieTask] No onNext function provided');
    }
  };

  // Pre-computed SVG paths with useMemo for performance
  const staticSegmentPaths = useMemo(() => {
    const paths: string[] = [];
    const angleStep = 360 / PIE_SEGMENTS;
    const rotation = rotationRef.current;

    for (let index = 0; index < PIE_SEGMENTS; index++) {
      const startAngle = (index * angleStep + rotation) * (Math.PI / 180);
      const endAngle = ((index + 1) * angleStep + rotation) * (Math.PI / 180);

      const x1 = center + radius * Math.cos(startAngle);
      const y1 = center + radius * Math.sin(startAngle);
      const x2 = center + radius * Math.cos(endAngle);
      const y2 = center + radius * Math.sin(endAngle);

      const largeArcFlag = angleStep > 180 ? 1 : 0;

      const pathData = [
        `M ${center} ${center}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');

      paths[index] = pathData;
    }

    return paths;
  }, [center, radius]);

  const createPieSegment = useCallback((index: number, isHighlighted = false) => {
    const fillColor = isHighlighted ? Colors.pieBlue : Colors.pieRed;

    return (
      <path
        key={index}
        d={staticSegmentPaths[index]}
        fill={fillColor}
        stroke="none"
      />
    );
  }, [staticSegmentPaths]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-8 bg-[#dfdfdfff]">
      <div className="bg-[#dfdfdfff] p-4 sm:p-8 max-w-lg w-full">
        <p className="text-base sm:text-lg font-semibold text-gray-800 text-center mb-4 sm:mb-6">
          {pieLevel === 1
            ? t('pieTask.instructionSingle')
            : t('pieTask.instructionMultiple')}
        </p>
        
        <div className="flex justify-center mb-6 sm:mb-8">
          <svg width={pieSize} height={pieSize}>
            <g>
              {/* First: Draw all segments without strokes */}
              {Array.from({ length: PIE_SEGMENTS }, (_, i) =>
                createPieSegment(i, targetSegments.includes(i))
              )}

              {/* Second: Draw outer circle border */}
              <path
                d={`M ${center + radius} ${center}
                    A ${radius} ${radius} 0 0 1 ${center} ${center + radius}
                    A ${radius} ${radius} 0 0 1 ${center - radius} ${center}
                    A ${radius} ${radius} 0 0 1 ${center} ${center - radius}
                    A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
                fill="none"
                stroke={Colors.textLight}
                strokeWidth={1}
                strokeLinecap="butt"
                strokeLinejoin="round"
              />

              {/* Third: Draw thick white separator lines to force visibility */}
              {Array.from({ length: PIE_SEGMENTS }, (_, i) => {
                const angleStep = 360 / PIE_SEGMENTS;
                const rotation = rotationRef.current;
                const angle = (i * angleStep + rotation) * (Math.PI / 180);
                const x = center + radius * Math.cos(angle);
                const y = center + radius * Math.sin(angle);

                return (
                  <path
                    key={`separator-${i}`}
                    d={`M ${center} ${center} L ${x} ${y}`}
                    stroke="white"
                    strokeWidth={3.8}
                    strokeLinecap="butt"
                  />
                );
              })}

              {/* Fourth: Draw thinner dark lines on top for better contrast */}
              {Array.from({ length: PIE_SEGMENTS }, (_, i) => {
                const angleStep = 360 / PIE_SEGMENTS;
                const rotation = rotationRef.current;
                const angle = (i * angleStep + rotation) * (Math.PI / 180);
                const x = center + radius * Math.cos(angle);
                const y = center + radius * Math.sin(angle);

                return (
                  <path
                    key={`separator-dark-${i}`}
                    d={`M ${center} ${center} L ${x} ${y}`}
                    stroke={Colors.textLight}
                    strokeWidth={3}
                    strokeLinecap="butt"
                  />
                );
              })}
            </g>
          </svg>
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={(e) => {
              console.log('[PieTask] Chevron button CLICK EVENT FIRED');
              console.log('[PieTask] Event target:', e.target);
              console.log('[PieTask] Current target:', e.currentTarget);
              
              e.preventDefault();
              e.stopPropagation();
              
              console.log('[PieTask] Chevron button clicked - START');
              handleNavigateToNext();
              console.log('[PieTask] Chevron button clicked - END');
            }}
            className="p-4 rounded-full transition-all duration-200 text-gray-600 hover:text-gray-800 hover:bg-gray-100 transform hover:scale-110"
            style={{ cursor: 'pointer', pointerEvents: 'auto' }}
            type="button"
          >
            <MdChevronRight size={72} />
          </button>
        </div>
      </div>
    </div>
  );
}