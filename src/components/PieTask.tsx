'use client';
import React, { useState, useEffect, useRef, useCallback, useMemo, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { MdChevronRight } from 'react-icons/md';
import { GlobalContext } from '../context/GlobalContext';
import { generateMathProblem, MathProblem } from '../utils/mathUtils';
import ScoreDisplay from './ScoreDisplay';

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
  
  // Inline Math Task state
  const [showMathTask, setShowMathTask] = useState(false);
  const [mathProblem, setMathProblem] = useState<MathProblem | null>(null);
  const [mathInput, setMathInput] = useState('');
  const [mathAnswered, setMathAnswered] = useState(false);
  const [pointsEarned, setPointsEarned] = useState<number | null>(null);
  const [showPointsAnimation, setShowPointsAnimation] = useState(false);
  const mathInputRef = useRef<HTMLInputElement>(null);
  
  // Get addPoints function from context
  const { addPoints, mathLevel, setCurrentTask } = contextValue || {};
  
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
    
    // BACKUP: Also save to localStorage for reliability
    if (typeof window !== 'undefined') {
      localStorage.setItem('pieTaskRotation', rotationRef.current.toString());
      localStorage.setItem('pieTaskTargetSegments', JSON.stringify(targetSegments));
      console.log('[PieTask DEBUG] Backup saved to localStorage');
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

  // Navigate to next task using inline math task
  const handleNavigateToNext = () => {
    console.log('[PieTask] handleNavigateToNext called - showing inline math task');
    console.log('[PieTask] Final rotation before math:', rotationRef.current);
    console.log('[PieTask] Final target segments before math:', targetSegments);
    
    // Ensure data is saved
    if (setPieRotation && setPieTargetSegments) {
      setPieRotation(rotationRef.current);
      setPieTargetSegments(targetSegments);
      console.log('[PieTask] Saved data before showing math task');
    }
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('pieTaskRotation', rotationRef.current.toString());
      localStorage.setItem('pieTaskTargetSegments', JSON.stringify(targetSegments));
      console.log('[PieTask] Saved to localStorage before showing math task');
    }
    
    // Call onDataUpdate callback if available
    if (onDataUpdate) {
      onDataUpdate(rotationRef.current, targetSegments);
      console.log('[PieTask] Called onDataUpdate with final data');
    }
    
    // Generate and show inline math task
    if (mathLevel) {
      const problem = generateMathProblem(mathLevel);
      setMathProblem(problem);
      setMathInput('');
      setMathAnswered(false);
      setShowMathTask(true);
      
      console.log('[PieTask] ✅ Inline math task shown');
      
      // Focus input immediately after direct user interaction
      setTimeout(() => {
        if (mathInputRef.current) {
          console.log('[PieTask] Focusing math input after user click...');
          mathInputRef.current.focus();
          mathInputRef.current.click();
        }
      }, 50);
    }
  };
  
  // Handle math task answer submission
  const handleMathSubmit = () => {
    if (!mathInput.trim() || mathAnswered || !mathProblem) return;
    
    const userAnswerNum = parseInt(mathInput);
    const isCorrect = userAnswerNum === mathProblem.correctAnswer;
    setMathAnswered(true);
    
    console.log('[PieTask] Math answer submitted:', { userAnswer: userAnswerNum, correct: isCorrect });
    
    // Calculate points earned
    const points = isCorrect ? (mathLevel || 1) : 0;
    setPointsEarned(points);
    
    // Add points through the global context
    if (addPoints) {
      addPoints('mathTask', isCorrect, mathLevel || 1);
      console.log(`[PieTask] Points added: ${points} (correct: ${isCorrect}, level: ${mathLevel})`);
    }
    
    // Show points animation
    if (points > 0) {
      setShowPointsAnimation(true);
      setTimeout(() => setShowPointsAnimation(false), 2000);
    }
    
    // Proceed to PieRecall after delay
    setTimeout(() => {
      setShowMathTask(false);
      setPointsEarned(null);
      setShowPointsAnimation(false);
      console.log('[PieTask] Proceeding to PieRecall after math completion');
      if (setCurrentTask) {
        setCurrentTask('pieRecall');
      } else {
        console.error('[PieTask] No setCurrentTask function provided, falling back to onNext');
        if (onNext) {
          onNext();
        }
      }
    }, 1200); // Slightly longer to show points animation
  };
  
  // Handle Enter key press in math input
  const handleMathKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !mathAnswered) {
      handleMathSubmit();
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
    <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-8 bg-[#dfdfdfff] relative">
      {/* Score Display */}
      <ScoreDisplay />
      
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
      
      {/* Inline Math Task */}
      {showMathTask && mathProblem && (
        <div className="fixed inset-0 bg-[#dfdfdfff] flex flex-col min-h-screen p-5 z-50 relative">
          {/* Score Display */}
          <ScoreDisplay />
          
          {/* Main Content */}
          <div className="flex-1 flex flex-col items-center justify-start md:justify-center">
            {/* Mobile spacing */}
            <div className="md:hidden" style={{ height: '20vh' }}></div>
            
            <div className="flex flex-col items-center max-w-md">
              {/* Math Equation */}
              <div className="flex items-center gap-4 mb-8">
                <span className="text-4xl font-bold text-gray-800">
                  {mathProblem.num1}
                </span>
                <span className="text-4xl font-bold text-gray-600">
                  {mathProblem.operator}
                </span>
                <span className="text-4xl font-bold text-gray-800">
                  {mathProblem.num2}
                </span>
                <span className="text-4xl font-bold text-gray-800">
                  =
                </span>
                <div className="relative">
                  <input
                    ref={mathInputRef}
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={mathInput}
                    onChange={(e) => setMathInput(e.target.value.replace(/\D/g, ''))}
                    onKeyDown={handleMathKeyPress}
                    onClick={() => {
                      console.log('[PieTask] Math input clicked, ensuring focus...');
                      mathInputRef.current?.focus();
                    }}
                    onTouchStart={() => {
                      console.log('[PieTask] Math input touched, ensuring focus...');
                      mathInputRef.current?.focus();
                    }}
                    onFocus={() => console.log('[PieTask] Math input focused successfully')}
                    maxLength={3}
                    placeholder="?"
                    disabled={mathAnswered}
                    autoFocus
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    style={{ 
                      fontFamily: 'Arial, Helvetica, sans-serif',
                      WebkitTapHighlightColor: 'rgba(0,123,255,0.2)',
                      WebkitUserSelect: 'text'
                    }}
                    className={`math-input w-20 h-12 text-3xl font-bold text-center border-2 rounded-lg cursor-pointer transition-all
                      ${mathAnswered 
                        ? 'bg-gray-100 border-gray-300 text-gray-600'
                        : 'bg-white border-blue-400 text-gray-800 focus:border-blue-500 focus:outline-none hover:border-blue-500 hover:shadow-md'
                      }`}
                  />
                  {!mathInput && !mathAnswered && (
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-blue-600 font-medium whitespace-nowrap">
                      Tippen zum Eingeben
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button with Chevron */}
              <button
                onClick={handleMathSubmit}
                disabled={!mathInput.trim() || mathAnswered}
                className={`p-4 rounded-full transition-all duration-200 mb-6 md:mb-0 relative
                  ${!mathInput.trim() || mathAnswered 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 transform hover:scale-110'
                  }`}
              >
                <MdChevronRight size={72} />
                
                {/* Points Animation */}
                {showPointsAnimation && pointsEarned && pointsEarned > 0 && (
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      +{pointsEarned} Punkt{pointsEarned > 1 ? 'e' : ''}
                    </div>
                  </div>
                )}
              </button>
              
              {/* Instruction */}
              <div className="text-sm text-gray-600 text-center mt-6 md:mt-6 opacity-50">
                Geben Sie die Antwort ein und drücken Sie Enter oder den Pfeil
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}