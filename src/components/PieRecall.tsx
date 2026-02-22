'use client';
import React, { useState, useRef, useMemo, useCallback, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { GlobalContext } from '../context/GlobalContext';

interface PieRecallProps {
  onComplete?: () => void;
  pieRotation?: number;
  pieTargetSegments?: number[];
}

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
  selectedGreen: '#4CAF50',
};

export default function PieRecall({ 
  onComplete, 
  pieRotation = 0, 
  pieTargetSegments = [] 
}: PieRecallProps) {
  const { t } = useTranslation();
  const contextValue = useContext(GlobalContext);
  const {
    pieLevel, 
    setPieLevel, 
    pieStreak, 
    setPieStreak, 
    addPoints, 
    trackTaskAttempt,
    reduceMathLevelOnError,
    pieRotation: contextPieRotation,
    pieTargetSegments: contextPieTargetSegments
  } = contextValue || {};

  // Safety check for context
  if (!contextValue) {
    console.error('[PieRecall] GlobalContext is undefined');
    return null;
  }

  // Use context values if available, fall back to props
  const actualPieRotation = contextPieRotation ?? pieRotation ?? 0;
  const actualPieTargetSegments = contextPieTargetSegments ?? pieTargetSegments ?? [];

  const [selectedSegments, setSelectedSegments] = useState<number[]>([]);
  const [temporaryClickedSegment, setTemporaryClickedSegment] = useState<number | null>(null);
  
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
          console.log('[PieRecall] Pie size changed from', currentSize, 'to', newSize);
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

  // Use the same rotation and target segments from GlobalContext or props
  const rotationRef = useRef(actualPieRotation);
  const currentLevel = pieLevel || 1;
  const targetSegments = actualPieTargetSegments;
  
  // Update rotation ref when context values change
  useEffect(() => {
    rotationRef.current = actualPieRotation;
  }, [actualPieRotation]);

  // Pre-computed SVG paths with useMemo for performance - same as PieTask
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
  }, [center, radius, actualPieRotation]);

  const handleSegmentPress = (segmentIndex: number) => {
    if (!setPieLevel || !setPieStreak || !addPoints || !reduceMathLevelOnError) {
      console.error('[PieRecall] Missing context functions');
      return;
    }

    const currentLevel = pieLevel || 1;

    if (currentLevel === 1) {
      // Level 1: Temporäre Einfärbung dann Feedback
      setTemporaryClickedSegment(segmentIndex);

      setTimeout(() => {
        setTemporaryClickedSegment(null);

        const isCorrect = targetSegments.includes(segmentIndex);

        if (isCorrect) {
          const newStreak = (pieStreak || 0) + 1;
          setPieStreak(newStreak);

          // Add points
          addPoints('pieTask', true, pieLevel || 1);

          // Level-Aufstieg nach 3 korrekten Antworten
          if (newStreak % 3 === 0 && currentLevel < 4) {
            setPieLevel(currentLevel + 1);
            setPieStreak(0);
            setTimeout(() => {
              if (onComplete) onComplete();
            }, 200);
          } else {
            setTimeout(() => {
              if (onComplete) onComplete();
            }, 200);
          }
        } else {
          // Add points and reduce levels on wrong answer
          addPoints('pieTask', false);
          reduceMathLevelOnError(); // Reduce MathLevel on any error

          // Level-Abstieg bei falscher Antwort (außer Level 1)
          if (currentLevel > 1) {
            setPieLevel(currentLevel - 1);
            setPieStreak(0);
            setTimeout(() => {
              if (onComplete) onComplete();
            }, 200);
          } else {
            setTimeout(() => {
              if (onComplete) onComplete();
            }, 200);
          }
        }
      }, 200);
    } else {
      // Level 2-4: Toggle-Funktionalität
      const isAlreadySelected = selectedSegments.includes(segmentIndex);

      if (isAlreadySelected) {
        // Entferne Auswahl
        setSelectedSegments(prev => prev.filter(seg => seg !== segmentIndex));
      } else {
        // Füge Auswahl hinzu
        const newSelectedSegments = [...selectedSegments, segmentIndex];
        setSelectedSegments(newSelectedSegments);

        // Warte kurz damit die visuelle Änderung gerendert wird, dann prüfe
        setTimeout(() => {
          // Prüfe ob korrekte Anzahl erreicht wurde
          if (newSelectedSegments.length === targetSegments.length) {
            // Prüfe Korrektheit aller Auswahlen
            const allCorrect = newSelectedSegments.every(selected =>
              targetSegments.includes(selected)
            ) && newSelectedSegments.length === targetSegments.length;

            if (allCorrect) {
              const newStreak = (pieStreak || 0) + 1;
              setPieStreak(newStreak);

              // Add points
              addPoints('pieTask', true, pieLevel || 1);

              // Level-Aufstieg nach 3 korrekten Antworten
              if (newStreak % 3 === 0 && currentLevel < 4) {
                setPieLevel(currentLevel + 1);
                setPieStreak(0);
                setTimeout(() => {
                  setSelectedSegments([]);
                  if (onComplete) onComplete();
                }, 200);
              } else {
                setTimeout(() => {
                  setSelectedSegments([]);
                  if (onComplete) onComplete();
                }, 200);
              }
            } else {
              // Add points and reduce levels on wrong answer
              addPoints('pieTask', false);
              reduceMathLevelOnError(); // Reduce MathLevel on any error

              // Level-Abstieg bei falscher Antwort
              if (currentLevel > 1) {
                setPieLevel(currentLevel - 1);
                setPieStreak(0);
                setTimeout(() => {
                  setSelectedSegments([]);
                  if (onComplete) onComplete();
                }, 200);
              } else {
                setTimeout(() => {
                  setSelectedSegments([]);
                  if (onComplete) onComplete();
                }, 200);
              }
            }
          }
        }, 50); // Kurze Verzögerung für visuelle Aktualisierung
      }
    }
  };

  const createPieSegment = useCallback((index: number, isSelected = false) => {
    let fillColor = Colors.pieRed;
    // Priorität: temporaryClickedSegment > isSelected
    if (temporaryClickedSegment === index) {
      fillColor = Colors.pieBlue;
    } else if (isSelected) {
      fillColor = Colors.pieBlue;
    }

    return (
      <path
        key={index}
        d={staticSegmentPaths[index]}
        fill={fillColor}
        stroke="none"
        style={{ cursor: 'pointer' }}
        onClick={() => handleSegmentPress(index)}
      />
    );
  }, [staticSegmentPaths, temporaryClickedSegment, handleSegmentPress]);

  const createClickableArea = useCallback((index: number) => {
    const angleStep = 360 / PIE_SEGMENTS;
    const rotation = rotationRef.current;
    const midAngle = ((index + 0.5) * angleStep + rotation) * (Math.PI / 180);

    // Calculate position for clickable area (middle of segment)
    const clickRadius = radius * 0.6; // Positioned closer to center for better coverage
    const clickX = center + clickRadius * Math.cos(midAngle);
    const clickY = center + clickRadius * Math.sin(midAngle);

    // Make clickable areas larger for better usability
    const buttonSize = Math.max(40, pieSize / 8); // Adaptive size based on pie size

    return (
      <button
        key={`click-${index}`}
        className="absolute rounded-full bg-transparent transition-colors"
        style={{
          width: buttonSize,
          height: buttonSize,
          left: clickX - (buttonSize / 2),
          top: clickY - (buttonSize / 2),
        }}
        onClick={() => handleSegmentPress(index)}
        aria-label={`Segment ${index + 1}`}
      />
    );
  }, [handleSegmentPress, center, radius, pieSize]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-8 bg-[#dfdfdfff]">
      <div className="bg-[#dfdfdfff] p-4 sm:p-8 max-w-lg w-full">
        <p className="text-base sm:text-lg font-semibold text-gray-800 text-center mb-4 sm:mb-6">
          {currentLevel === 1
            ? t('pieRecall.instructionSingle')
            : t('pieRecall.instructionMultiple')
          }
        </p>
        
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="relative">
            <svg width={pieSize} height={pieSize}>
              <g>
                {/* First: Draw all segments without strokes */}
                {Array.from({ length: PIE_SEGMENTS }, (_, i) =>
                  createPieSegment(i, selectedSegments.includes(i))
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
        </div>
        
        {/* Show current selections for levels > 1 */}
        {currentLevel > 1 && selectedSegments.length > 0 && (
          <div className="text-center text-xs sm:text-sm text-gray-600 mb-4">
            Ausgewählt: {selectedSegments.length} von {targetSegments.length} Segmenten
          </div>
        )}
      </div>
    </div>
  );
}