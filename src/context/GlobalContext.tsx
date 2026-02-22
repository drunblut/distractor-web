import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef, useMemo } from 'react';
import PieTask from '../components/PieTask';
import PieRecall from '../components/PieRecall';

export interface GlobalContextType {
  // App initialization states
  isLoading: boolean;
  loadingProgress: number;
  loadingText: string;
  
  // Session management for multi-user support
  clientSessionId: string;
  
  // Math-related states
  mathLevel: number;
  setMathLevel: (level: number) => void;
  mathStreak: number;
  setMathStreak: (streak: number) => void;
  
  // Pie-related states
  pieLevel: number;
  setPieLevel: (level: number) => void;
  pieStreak: number;
  setPieStreak: (streak: number) => void;
  pieTargetSegments: number[];
  setPieTargetSegments: (segments: number[]) => void;
  pieRotation: number;
  setPieRotation: (rotation: number) => void;
  
  // Chess-related states
  chessLevel: number;
  setChessLevel: (level: number) => void;
  chessStreak: number;
  setChessStreak: (streak: number) => void;
  circlePositions: Array<{row: number, col: number}>;
  setCirclePositions: (positions: Array<{row: number, col: number}>) => void;
  
  // Faden-related states
  fadenLevel: number;
  setFadenLevel: (level: number) => void;
  fadenStreak: number;
  setFadenStreak: (streak: number) => void;
  
  // Hand-related states
  handLevel: number;
  setHandLevel: (level: number) => void;
  handStreak: number;
  setHandStreak: (streak: number) => void;
  handData: { hand: string; finger: number };
  setHandData: (data: { hand: string; finger: number }) => void;
  
  // Face1-related states
  face1Level: number;
  setFace1Level: (level: number) => void;
  face1Streak: number;
  setFace1Streak: (streak: number) => void;
  face1Data: { targetFace: number };
  setFace1Data: (data: { targetFace: number }) => void;
  
  // Face2-related states
  face2Level: number;
  setFace2Level: (level: number) => void;
  face2Streak: number;
  setFace2Streak: (streak: number) => void;
  face2Data: { targetFaces: number[]; clickedFaces?: number[]; currentRound?: number };
  setFace2Data: (data: { targetFaces: number[]; clickedFaces?: number[]; currentRound?: number }) => void;
  
  // Points and scoring - Enhanced system like original Distractor App
  totalPoints: number;
  setTotalPoints: (points: number) => void;
  addPoints: (taskType: string, correct: boolean, level?: number) => void;
  phaseResults: {
    [phase: number]: {
      totalPoints: number;
      taskResults: {
        [taskType: string]: {
          attempts: number;
          correct: number;
          points: number;
          level: number;
          accuracy: number;
        };
      };
    };
  };
  setPhaseResults: (results: any) => void;
  resetScoring: () => void;
  // Track phase-specific points
  phasePoints: {
    [phase: number]: number;
  };
  addPhasePoints: (phase: number, points: number) => void;
  
  // Navigation
  currentTask: string | null;
  setCurrentTask: (task: string | null) => void;
  nextTask: () => void;
  
  // Statistics
  trackTaskAttempt: (taskType: string, correct: boolean) => void;
  reduceMathLevelOnError: () => void;
  completePhase: () => void;
  
  // Task statistics debugging
  resetTaskStats: () => void;
  
  // Task statistics
  taskStats: {
    [taskType: string]: {
      attempts: number;
      correct: number;
      level: number;
    };
  };
  
  // Task Queue und Phase System
  taskQueue: string[];
  setTaskQueue: (queue: string[]) => void;
  currentTaskIndex: number;
  setCurrentTaskIndex: (index: number) => void;
  generateTaskQueue: (phase?: number) => string[];
  currentPhase: number;
  setCurrentPhase: (phase: number) => void;
  phaseTimer: number;
  setPhaseTimer: (time: number) => void;
  isPhaseActive: boolean;
  setIsPhaseActive: (active: boolean) => void;
  pendingPhaseChange: number | null;
  setPendingPhaseChange: (phase: number | null) => void;
  executePhaseTransition: () => boolean;
  
  // Navigation tracking
  previousTask: string | null;
  setPreviousTask: (task: string | null) => void;
  navigateToNextTask: () => void;
  
  // Component wrappers (handlers are now stable refs within the wrappers)
  PieTaskWrapper: React.ComponentType;
  PieRecallWrapper: React.ComponentType;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

interface GlobalProviderProps {
  children: ReactNode;
}

export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
  // ========================================
  // ALL STATE DECLARATIONS FIRST
  // ========================================
  
  // Generate or retrieve client session ID for multi-user support
  const [clientSessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      let sessionId = localStorage.getItem('distractorAppClientSessionId');
      if (!sessionId) {
        // Generate new session ID: timestamp + random string
        sessionId = 'client_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('distractorAppClientSessionId', sessionId);
        console.log('[Session] Generated new client session ID:', sessionId);
      } else {
        console.log('[Session] Retrieved existing client session ID:', sessionId);
      }
      return sessionId;
    }
    return 'server_fallback_' + Math.random().toString(36).substr(2, 9);
  });
  
  // App loading states
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initialisierung...');
  
  // Math states
  const [mathLevel, setMathLevel] = useState(1);
  const [mathStreak, setMathStreak] = useState(0);
  
  // Pie states
  const [pieLevel, setPieLevel] = useState(1);
  const [pieStreak, setPieStreak] = useState(0);
  const [pieTargetSegments, setPieTargetSegments] = useState<number[]>([]);
  const [pieRotation, setPieRotation] = useState(0);
  
  // Chess states
  const [chessLevel, setChessLevel] = useState(1);
  const [chessStreak, setChessStreak] = useState(0);
  const [circlePositions, setCirclePositions] = useState<Array<{row: number, col: number}>>([]);
  
  // Faden states
  const [fadenLevel, setFadenLevel] = useState(1);
  const [fadenStreak, setFadenStreak] = useState(0);
  
  // Hand states
  const [handLevel, setHandLevel] = useState(1);
  const [handStreak, setHandStreak] = useState(0);
  const [handData, setHandData] = useState<{ hand: string; finger: number }>({ hand: '', finger: 0 });
  
  // Face1 states
  const [face1Level, setFace1Level] = useState(1);
  const [face1Streak, setFace1Streak] = useState(0);
  const [face1Data, setFace1Data] = useState<{ targetFace: number }>({ targetFace: 1 });
  
  // Face2 states
  const [face2Level, setFace2Level] = useState(1);
  const [face2Streak, setFace2Streak] = useState(0);
  const [face2Data, setFace2Data] = useState<{ targetFaces: number[]; clickedFaces?: number[]; currentRound?: number }>({ targetFaces: [] });
  
  // Scoring states
  // Phase-specific points tracking
  const [phasePoints, setPhasePoints] = useState<{[phase: number]: number}>({
    1: 0,
    2: 0, 
    3: 0
  });

  // Function to add points to specific phase
  const addPhasePoints = useCallback((phase: number, points: number) => {
    setPhasePoints(prev => ({
      ...prev,
      [phase]: (prev[phase] || 0) + points
    }));
    console.log(`[Phase Points] Added ${points} points to Phase ${phase}`);
  }, []);

  const [totalPoints, setTotalPoints] = useState(0);
  const [phaseResults, setPhaseResults] = useState<{
    [phase: number]: {
      totalPoints: number;
      taskResults: {
        [taskType: string]: {
          attempts: number;
          correct: number;
          points: number;
          level: number;
          accuracy: number;
        };
      };
    };
  }>({});
  
  // Navigation - start with null to allow StartScreen/MoodScreen flow
  const [currentTask, setCurrentTask] = useState<string | null>(null);
  const [previousTask, setPreviousTask] = useState<string | null>(null);
  
  // Task statistics
  const [taskStats, setTaskStats] = useState<{
    [taskType: string]: {
      attempts: number;
      correct: number;
      level: number;
    };
  }>({});

  // Validate and clean taskStats to fix data corruption issues
  const validateAndCleanTaskStats = useCallback((stats: any) => {
    const cleanStats: typeof taskStats = {};
    
    if (stats && typeof stats === 'object') {
      Object.entries(stats).forEach(([taskType, taskData]: [string, any]) => {
        if (taskData && typeof taskData === 'object') {
          const attempts = typeof taskData.attempts === 'number' && taskData.attempts >= 0 && taskData.attempts < 1000 
            ? taskData.attempts : 0;
          const correct = typeof taskData.correct === 'number' && taskData.correct >= 0 && taskData.correct <= attempts 
            ? taskData.correct : 0;
          const level = typeof taskData.level === 'number' && taskData.level >= 1 && taskData.level <= 4 
            ? taskData.level : 1;
          
          cleanStats[taskType] = { attempts, correct, level };
        }
      });
    }
    
    return cleanStats;
  }, []);

  // Clean task stats function for debugging
  const resetTaskStats = useCallback(() => {
    console.log('[TaskStats] Resetting all task statistics');
    setTaskStats({});
    
    // Also clean localStorage
    try {
      const savedSession = localStorage.getItem('currentSession');
      if (savedSession) {
        const sessionData = JSON.parse(savedSession);
        sessionData.taskStats = {};
        localStorage.setItem('currentSession', JSON.stringify(sessionData));
        console.log('[LocalStorage] Task stats cleared in session');
      }
    } catch (error) {
      console.error('[LocalStorage] Error clearing task stats:', error);
    }
  }, []);
  
  // Task Queue und Phase System
  const [taskQueue, setTaskQueue] = useState<string[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [phaseTimer, setPhaseTimer] = useState(30); // Phase 1: 30 Sekunden (TESTING)
  const [isPhaseActive, setIsPhaseActive] = useState(true);
  const [pendingPhaseChange, setPendingPhaseChange] = useState<number | null>(null);
  
  // Track if pie data has been initialized to prevent multiple calls
  const pieDataInitialized = useRef(false);
  const appInitialized = useRef(false);
  
  // Prevent duplicate trackTaskAttempt calls
  const lastTaskAttemptRef = useRef<{taskType: string, timestamp: number} | null>(null);
  
  // ========================================
  // ALL FUNCTION DEFINITIONS AFTER STATE
  // ========================================
  
  // Shuffle array function
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Remove consecutive duplicate tasks from array
  const removeConsecutiveDuplicates = (tasks: string[]): string[] => {
    const result = [...tasks];
    let attempts = 0;
    const maxAttempts = 100; // Prevent infinite loops

    while (attempts < maxAttempts) {
      let foundDuplicate = false;

      for (let i = 0; i < result.length - 1; i++) {
        if (result[i] === result[i + 1]) {
          // Find a different task to swap with
          for (let j = i + 2; j < result.length; j++) {
            if (result[j] !== result[i] && result[j] !== result[i - 1]) {
              // Swap tasks
              [result[i + 1], result[j]] = [result[j], result[i + 1]];
              foundDuplicate = true;
              break;
            }
          }
          if (foundDuplicate) break;
        }
      }

      if (!foundDuplicate) break;
      attempts++;
    }

    return result;
  };
  
  // Original Distractor App Complex Scoring System
  const trackTaskAttempt = useCallback((taskType: string, correct: boolean) => {
    // CRITICAL: Prevent duplicate calls within 500ms for same task type
    const now = Date.now();
    const lastAttempt = lastTaskAttemptRef.current;
    
    if (lastAttempt && lastAttempt.taskType === taskType && (now - lastAttempt.timestamp) < 500) {
      console.warn(`[DUPLICATE PROTECTION] Blocking duplicate trackTaskAttempt for ${taskType} within 500ms`);
      return;
    }
    
    lastTaskAttemptRef.current = { taskType, timestamp: now };
    
    console.log(`[CRITICAL DEBUG] trackTaskAttempt called: ${taskType}, correct=${correct}`);
    console.log(`[CRITICAL DEBUG] Current taskStats before update:`, taskStats);
    
    setTaskStats(prev => {
      const currentStats = prev[taskType] || { attempts: 0, correct: 0, level: 1 };
      console.log(`[CRITICAL DEBUG] Previous ${taskType} stats:`, currentStats);
      
      // Validation: Check for corrupted data
      if (typeof currentStats.attempts !== 'number' || currentStats.attempts < 0 || currentStats.attempts > 999) {
        console.warn(`[TaskStats] Corrupted attempts data detected for ${taskType}:`, currentStats.attempts, '- resetting to 0');
        currentStats.attempts = 0;
      }
      
      if (typeof currentStats.correct !== 'number' || currentStats.correct < 0 || currentStats.correct > currentStats.attempts + 1) {
        console.warn(`[TaskStats] Corrupted correct data detected for ${taskType}:`, currentStats.correct, '- resetting to 0'); 
        currentStats.correct = 0;
      }
      
      // Get current level for this task type - read directly without dependencies
      let currentLevel = 1;
      switch (taskType) {
        case 'mathTask':
          currentLevel = mathLevel;
          break;
        case 'pieTask':
          currentLevel = pieLevel;
          break;
        case 'chessTask':
          currentLevel = chessLevel;
          break;
        case 'face1Task':
          currentLevel = face1Level;
          break;
        case 'face2Task':
          currentLevel = face2Level;
          break;
        case 'fadenTask':
        case 'handTask':
          // These tasks have no level system - always Level 1
          currentLevel = 1;
          break;
      }
      
      const newStats = {
        ...prev,
        [taskType]: {
          attempts: currentStats.attempts + 1,
          correct: currentStats.correct + (correct ? 1 : 0),
          level: currentLevel
        }
      };
      
      console.log(`[CRITICAL DEBUG] NEW ${taskType} stats:`, newStats[taskType]);
      console.log(`[CRITICAL DEBUG] Calculation check: ${currentStats.attempts} + 1 = ${currentStats.attempts + 1}`);
      
      // Save task stats to localStorage
      saveTaskStatsToLocalStorage(newStats);
      
      return newStats;
    });
    
    console.log(`[TaskStats] ${taskType}: attempt recorded (correct: ${correct})`);
  }, []); // Empty deps - values read directly from current state

  // Save task stats to localStorage for later database sync
  const saveTaskStatsToLocalStorage = useCallback((newTaskStats: typeof taskStats) => {
    try {
      const savedSession = localStorage.getItem('currentSession');
      if (savedSession) {
        const sessionData = JSON.parse(savedSession);
        
        // CRITICAL FIX: Ensure we never save points as attempts
        const cleanedTaskStats: typeof taskStats = {};
        Object.entries(newTaskStats).forEach(([taskType, stats]) => {
          if (stats && typeof stats === 'object') {
            cleanedTaskStats[taskType] = {
              attempts: typeof stats.attempts === 'number' && stats.attempts >= 0 && stats.attempts <= 100 ? stats.attempts : 0,
              correct: typeof stats.correct === 'number' && stats.correct >= 0 && stats.correct <= stats.attempts ? stats.correct : 0,
              level: typeof stats.level === 'number' && stats.level >= 1 && stats.level <= 4 ? stats.level : 1
            };
          }
        });
        
        console.log(`[LocalStorage] Cleaned taskStats before saving:`, cleanedTaskStats);
        
        sessionData.taskStats = cleanedTaskStats;
        sessionData.totalPoints = totalPoints;
        sessionData.phasePoints = phasePoints; // Save phase points too
        sessionData.lastUpdated = new Date().toISOString();
        localStorage.setItem('currentSession', JSON.stringify(sessionData));
        console.log('[LocalStorage] Task stats updated in session');
      }
    } catch (error) {
      console.error('[LocalStorage] Error saving task stats:', error);
    }
  }, [totalPoints, phasePoints]);

  // Original Distractor App Points Calculation (Task and Level-based)
  const getPointsForTask = useCallback((taskType: string, level: number): number => {
    const pointsTable: { [taskType: string]: { [level: number]: number } } = {
      pieTask: { 1: 3, 2: 5, 3: 9, 4: 14 },
      chessTask: { 1: 3, 2: 5, 3: 9, 4: 14 },
      mathTask: { 1: 1, 2: 2, 3: 3, 4: 4 },
      handTask: { 1: 3, 2: 0, 3: 0, 4: 0 }, // Nur Level 1 hat Punkte
      fadenTask: { 1: 3, 2: 0, 3: 0, 4: 0 }, // Nur Level 1 hat Punkte
      face1Task: { 1: 3, 2: 5, 3: 7, 4: 0 },
      face2Task: { 1: 5, 2: 10, 3: 15, 4: 0 }
    };
    return pointsTable[taskType]?.[level] || 0;
  }, []);

  // Math Task Level Management (Original 5-Streak System)
  const updateMathLevel = useCallback((correct: boolean, currentStreak: number) => {
    if (correct) {
      // Check for level up after 5 consecutive correct answers
      const newStreak = currentStreak + 1;
      setMathStreak(newStreak);
      
      if (newStreak >= 5 && mathLevel < 4) {
        setMathLevel(prev => {
          const newLevel = Math.min(4, prev + 1);
          console.log(`[Math Level] Level UP: ${prev} → ${newLevel} (after ${newStreak} correct)`);
          return newLevel;
        });
        setMathStreak(0); // Reset streak after level up
      }
    } else {
      // Immediate level down on error (except level 1)
      setMathLevel(prev => {
        const newLevel = Math.max(1, prev - 1);
        if (newLevel !== prev) {
          console.log(`[Math Level] Level DOWN: ${prev} → ${newLevel} (error)`);
        }
        return newLevel;
      });
      setMathStreak(0); // Reset streak on error
    }
  }, [mathLevel]);

  // 3-Streak System for Other Tasks (Pie, Chess, Faden, Hand, Face)
  const update3StreakTaskLevel = useCallback((taskType: string, correct: boolean, currentStreak: number, currentLevel: number, setLevel: (level: number) => void, setStreak: (streak: number) => void) => {
    if (correct) {
      const newStreak = currentStreak + 1;
      setStreak(newStreak);
      
      // Level up every 3 correct answers
      if (newStreak % 3 === 0 && currentLevel < 4) {
        setLevel(Math.min(4, currentLevel + 1));
        console.log(`[${taskType} Level] Level UP: ${currentLevel} → ${Math.min(4, currentLevel + 1)} (after ${newStreak} correct)`);
      }
    } else {
      // Immediate level down on error (except level 1)
      const newLevel = Math.max(1, currentLevel - 1);
      if (newLevel !== currentLevel) {
        setLevel(newLevel);
        console.log(`[${taskType} Level] Level DOWN: ${currentLevel} → ${newLevel} (error)`);
      }
      setStreak(0); // Reset streak on error
    }
  }, []);

  // Original Cross-Task Error Effect: Any error reduces Math level
  const applyMathLevelErrorReduction = useCallback(() => {
    setMathLevel(prev => {
      const newLevel = Math.max(1, prev - 1);
      if (newLevel !== prev) {
        console.log(`[Cross-Task Effect] Math Level reduced: ${prev} → ${newLevel} (error in other task)`);
      }
      return newLevel;
    });
    setMathStreak(0); // Also reset math streak
  }, []);

  // Enhanced addPoints with original scoring logic
  const addPoints = useCallback((taskType: string, correct: boolean, level?: number) => {
    console.log(`[CRITICAL DEBUG] addPoints called: ${taskType}, correct=${correct}, level=${level}`);
    
    // Track the attempt first (for both correct and incorrect)
    trackTaskAttempt(taskType, correct);
    
    // Apply level progression based on task type
    if (taskType === 'mathTask') {
      updateMathLevel(correct, mathStreak);
    } else {
      // Apply cross-task error effect for non-math tasks
      if (!correct) {
        applyMathLevelErrorReduction();
      }
      
      // Update levels for tasks with level system (3-streak system)
      // HandTask and FadenTask have NO levels - only fixed scoring
      switch (taskType) {
        case 'pieTask':
          update3StreakTaskLevel('Pie', correct, pieStreak, pieLevel, setPieLevel, setPieStreak);
          break;
        case 'chessTask':
          update3StreakTaskLevel('Chess', correct, chessStreak, chessLevel, setChessLevel, setChessStreak);
          break;
        case 'face1Task':
          update3StreakTaskLevel('Face1', correct, face1Streak, face1Level, setFace1Level, setFace1Streak);
          break;
        case 'face2Task':
          update3StreakTaskLevel('Face2', correct, face2Streak, face2Level, setFace2Level, setFace2Streak);
          break;
        // HandTask and FadenTask: No level progression - always Level 1
        case 'fadenTask':
        case 'handTask':
          // These tasks have no level system - always stay at Level 1
          console.log(`[${taskType}] No level progression - always Level 1, Correct: ${correct}`);
          break;
      }
    }
    
    // Only award points for correct answers
    if (!correct) return;
    
    // Get current level for the specific task type for accurate point calculation
    let currentLevel = level || 1;
    if (!level) {
      switch (taskType) {
        case 'mathTask':
          currentLevel = mathLevel;
          break;
        case 'pieTask':
          currentLevel = pieLevel;
          break;
        case 'chessTask':
          currentLevel = chessLevel;
          break;
        case 'face1Task':
          currentLevel = face1Level;
          break;
        case 'face2Task':
          currentLevel = face2Level;
          break;
        case 'fadenTask':
          currentLevel = fadenLevel;
          break;
        case 'handTask':
          currentLevel = handLevel;
          break;
        default:
          currentLevel = 1;
      }
    }
    
    const pointsToAdd = getPointsForTask(taskType, currentLevel);
    
    setTotalPoints(prev => {
      const newTotal = prev + pointsToAdd;
      // Update localStorage immediately when points change
      updateTotalPointsInLocalStorage(newTotal);
      return newTotal;
    });
    
    // Track phase-specific points
    if (pointsToAdd > 0) {
      addPhasePoints(currentPhase, pointsToAdd);
    }
    
    console.log(`[Original Scoring] ${taskType}: +${pointsToAdd} points (Level ${currentLevel}), Correct: ${correct}, Phase: ${currentPhase}`);
  }, [mathStreak, pieStreak, chessStreak, fadenStreak, handStreak, face1Streak, face2Streak,
      pieLevel, chessLevel, fadenLevel, handLevel, face1Level, face2Level, mathLevel,
      updateMathLevel, update3StreakTaskLevel, applyMathLevelErrorReduction, getPointsForTask, trackTaskAttempt, currentPhase, addPhasePoints]);

  // Update total points in localStorage
  const updateTotalPointsInLocalStorage = useCallback((newTotalPoints: number) => {
    try {
      const savedSession = localStorage.getItem('currentSession');
      if (savedSession) {
        const sessionData = JSON.parse(savedSession);
        sessionData.totalPoints = newTotalPoints;
        sessionData.phasePoints = phasePoints; // Update phase points too
        sessionData.lastUpdated = new Date().toISOString();
        localStorage.setItem('currentSession', JSON.stringify(sessionData));
        console.log('[LocalStorage] Total points updated:', newTotalPoints);
      }
    } catch (error) {
      console.error('[LocalStorage] Error updating total points:', error);
    }
  }, [phasePoints]);
  
  // Original reduceMathLevelOnError - now handled by applyMathLevelErrorReduction
  const reduceMathLevelOnError = useCallback(() => {
    applyMathLevelErrorReduction();
  }, [applyMathLevelErrorReduction]);

  // Phase completion and results calculation
  const completePhase = useCallback(() => {
    const currentPhaseResults = {
      totalPoints,
      taskResults: {} as any
    };

    // Calculate results for each task type
    Object.keys(taskStats).forEach(taskType => {
      const stats = taskStats[taskType];
      if (stats.attempts > 0) {
        currentPhaseResults.taskResults[taskType] = {
          attempts: stats.attempts,
          correct: stats.correct,
          points: stats.correct, // Points equal correct answers in basic system
          level: stats.level,
          accuracy: (stats.correct / stats.attempts) * 100
        };
      }
    });

    setPhaseResults(prev => ({
      ...prev,
      [currentPhase]: currentPhaseResults
    }));

    console.log(`[Phase Completion] Phase ${currentPhase} completed with ${totalPoints} points`);
  }, [totalPoints, taskStats, currentPhase]);

  const resetScoring = useCallback(() => {
    setTotalPoints(0);
    setTaskStats({});
    setPhasePoints({ 1: 0, 2: 0, 3: 0 });
  }, []);

  // Generate task queue based on current phase
  const generateTaskQueue = useCallback((phase: number = currentPhase): string[] => {
    let tasks: string[] = [];

    switch (phase) {
      case 1:
        // Phase 1: Original configuration
        tasks = [
          ...Array(6).fill('pieTask'),     // 6 pie tasks
          ...Array(7).fill('chessTask'),   // 7 chess tasks
          ...Array(4).fill('handTask'),    // 4 hand tasks
          ...Array(2).fill('fadenTask')    // 2 faden tasks
        ];
        break;
      case 2:
        // Phase 2: New configuration
        tasks = [
          ...Array(5).fill('pieTask'),
          ...Array(5).fill('chessTask'),
          ...Array(3).fill('handTask'),
          ...Array(1).fill('fadenTask'),
          ...Array(6).fill('face1Task')
        ];
        break;
      case 3:
        // Phase 3: Mix aus allen Tasks mit Face2Task
        tasks = [
          ...Array(4).fill('pieTask'),
          ...Array(4).fill('chessTask'),
          ...Array(3).fill('handTask'),
          ...Array(2).fill('fadenTask'),
          ...Array(5).fill('face2Task')  // Face2Task in Phase 3
        ];
        break;
    }

    const shuffledTasks = shuffleArray(tasks);
    const tasksWithoutDuplicates = removeConsecutiveDuplicates(shuffledTasks);

    // Always start with pieTask for Phase 1, random for others
    if (phase === 1) {
      const finalQueue = ['pieTask', ...tasksWithoutDuplicates];
      if (finalQueue[1] === 'pieTask') {
        // Find first non-pieTask and swap with position 1
        for (let i = 2; i < finalQueue.length; i++) {
          if (finalQueue[i] !== 'pieTask') {
            [finalQueue[1], finalQueue[i]] = [finalQueue[i], finalQueue[1]];
            break;
          }
        }
      }
      return finalQueue;
    } else {
      return tasksWithoutDuplicates;
    }
  }, [currentPhase]);

  // Funktion zum direkten Durchführen eines Phasenwechsels (wird an Checkpoints aufgerufen)
  const executePhaseTransition = useCallback(() => {
    console.log(`[PHASE DEBUG] executePhaseTransition called - Timer: ${phaseTimer}, Current Phase: ${currentPhase}, Pending: ${pendingPhaseChange}`);
    
    // Check if phase transition is needed (either timer expired OR pending transition set)
    const shouldTransition = phaseTimer <= 0 || pendingPhaseChange !== null;
    
    if (shouldTransition) {
      console.log(`[PHASE DEBUG] Phase transition triggered - Timer: ${phaseTimer <= 0 ? 'expired' : 'active'}, Pending: ${pendingPhaseChange}`);
      
      // Clear pending flag first
      const targetPhase = pendingPhaseChange || (currentPhase + 1);
      setPendingPhaseChange(null);
      
      if (targetPhase === 2) {
        console.log('[PHASE DEBUG] Phase 1 completed - switching to Phase 2');
        completePhase(); // Save Phase 1 results
        setCurrentPhase(2);
        setPhaseTimer(30); // 30 Sekunden für Phase 2 (TESTING)
        const phase2Queue = generateTaskQueue(2);
        console.log('[PHASE 2 QUEUE] Generated Phase 2 queue with tasks:', phase2Queue);
        console.log('[PHASE 2 QUEUE] Queue length:', phase2Queue.length);
        console.log('[PHASE 2 QUEUE] Task distribution:', {
          pieTask: phase2Queue.filter(task => task === 'pieTask').length,
          chessTask: phase2Queue.filter(task => task === 'chessTask').length,
          handTask: phase2Queue.filter(task => task === 'handTask').length,
          fadenTask: phase2Queue.filter(task => task === 'fadenTask').length,
          face1Task: phase2Queue.filter(task => task === 'face1Task').length
        });
        setTaskQueue(phase2Queue);
        setCurrentTaskIndex(0);
        setCurrentTask(phase2Queue[0]);
        console.log('[PHASE DEBUG] Successfully moved to Phase 2 (180 seconds) - Starting with:', phase2Queue[0]);
        return true; // Phase change executed
      } else if (targetPhase === 3) {
        console.log('[PHASE DEBUG] Phase 2 completed - switching to Phase 3');
        completePhase(); // Save Phase 2 results
        setCurrentPhase(3);
        setPhaseTimer(30); // 30 Sekunden für Phase 3 (TESTING)
        const phase3Queue = generateTaskQueue(3);
        console.log('[PHASE DEBUG] Generated Phase 3 Queue:', phase3Queue);
        console.log('[PHASE DEBUG] Face2Task count in Phase 3:', phase3Queue.filter(task => task === 'face2Task').length);
        console.log('[PHASE DEBUG] Face1Task count in Phase 3:', phase3Queue.filter(task => task === 'face1Task').length);
        setTaskQueue(phase3Queue);
        setCurrentTaskIndex(0);
        setCurrentTask(phase3Queue[0]);
        console.log('[PHASE DEBUG] Successfully moved to Phase 3 (30 seconds):', phase3Queue);
        return true; // Phase change executed
      } else {
        console.log('[PHASE DEBUG] All phases completed - showing post-game mood screen');
        setIsPhaseActive(false);
        completePhase();
        setCurrentTask('postGameMood');
        console.log('[PHASE DEBUG] All phases completed - navigating to post-game mood screen!');
        return true; // Session ended
      }
    }
    console.log(`[PHASE DEBUG] No phase change needed - Timer: ${phaseTimer}, No pending transition`);
    return false; // No phase change
  }, [currentPhase, pendingPhaseChange, generateTaskQueue, completePhase]);

  const navigateToNextTask = useCallback(() => {
    console.log(`[NAV DEBUG] Navigation called - Current: ${currentTask}, Phase: ${currentPhase}, Timer: ${phaseTimer}, Pending: ${pendingPhaseChange}`);
    
    // Special case: Navigate from postGameMood to results
    if (currentTask === 'postGameMood') {
      console.log('[NAV DEBUG] Navigating from postGameMoodScreen to results');
      setCurrentTask('results');
      setPreviousTask('postGameMood');
      return;
    }
    
    // Check for pending phase transitions FIRST, regardless of queue position
    if (pendingPhaseChange !== null) {
      console.log(`[NAV DEBUG] Pending phase change detected (${pendingPhaseChange}) - executing transition immediately`);
      const phaseChanged = executePhaseTransition();
      console.log(`[NAV DEBUG] executePhaseTransition returned: ${phaseChanged}`);
      if (phaseChanged) {
        console.log(`[NAV DEBUG] Phase transition completed - new phase will start`);
        return; // Exit early, new phase will handle navigation
      }
    }
    
    // Use queue-based navigation system like stableHandlePieRecallComplete
    setCurrentTaskIndex((prevIndex: number) => {
      const nextIndex = prevIndex + 1;
      console.log(`[NAV DEBUG] Moving from index ${prevIndex} to ${nextIndex}`);
      
      if (nextIndex < taskQueue.length) {
        const nextTask = taskQueue[nextIndex];
        console.log(`[NAV DEBUG] Next task from queue: ${nextTask}`);
        setCurrentTask(nextTask);
        setPreviousTask(currentTask); // Set current as previous for potential return navigation
        return nextIndex;
      } else {
        // Queue completed - check timer before deciding next action
        console.log(`[NAV DEBUG] Queue completed - Timer: ${phaseTimer}s remaining`);
        
        if (phaseTimer > 0) {
          // Timer still running - regenerate queue for current phase
          console.log(`[NAV DEBUG] Timer still active (${phaseTimer}s) - regenerating queue for Phase ${currentPhase}`);
          const newQueue = generateTaskQueue(currentPhase);
          setTaskQueue(newQueue);
          setCurrentTaskIndex(-1); // Reset index so next increment goes to 0
          
          // Start with first task of new queue
          if (newQueue.length > 0) {
            console.log(`[NAV DEBUG] New queue generated with ${newQueue.length} tasks, starting with: ${newQueue[0]}`);
            setCurrentTask(newQueue[0]);
            setPreviousTask(currentTask);
            return 0; // Set index to first task
          }
        } else {
          // Timer expired - navigate to next phase or end
          console.log(`[NAV DEBUG] Timer expired - navigating to end phase`);
          if (currentPhase === 3) {
            setCurrentTask('postGameMood');
          } else {
            // Set pending phase change to trigger transition after current task
            setPendingPhaseChange(currentPhase + 1);
            console.log(`[NAV DEBUG] Setting pending phase change to Phase ${currentPhase + 1}`);
          }
          setPreviousTask(null);
        }
        return prevIndex;
      }
    });
  }, [currentTask, currentPhase, phaseTimer, pendingPhaseChange, executePhaseTransition, taskQueue, generateTaskQueue]);
  
  const nextTask = useCallback(() => {
    // Deprecated - use navigateToNextTask instead
    navigateToNextTask();
  }, [navigateToNextTask]);

  // Stable callback functions using useRef to prevent re-renders
  const stableHandlePieDataUpdate = useRef((rotation: number, segments: number[]) => {
    console.log('[GlobalContext] Pie data update called with rotation:', rotation, 'segments:', segments);
    // Always save the rotation data, regardless of initialization state
    setPieRotation(rotation);
    setPieTargetSegments(segments);
    pieDataInitialized.current = true;
    console.log('[GlobalContext] Pie data saved to context');
  });

  const stableHandlePieTaskComplete = useRef(() => {
    console.log('[GlobalContext] PieTask completed - navigating to mathTask');
    setPreviousTask('pieTask');
    setCurrentTask('mathTask');
  });

  const stableHandlePieTaskNext = useRef(() => {
    console.log('[GlobalContext] PieTask onNext - navigating to mathTask');
    setPreviousTask('pieTask');
    setCurrentTask('mathTask');
  });

  const stableHandleChessTaskComplete = useRef(() => {
    console.log('[GlobalContext] ChessTask completed - navigating to mathTask');
    setPreviousTask('chessTask');
    setCurrentTask('mathTask');
  });

  const stableHandleChessTaskNext = useRef(() => {
    console.log('[GlobalContext] ChessTask onNext - navigating to mathTask');
    setPreviousTask('chessTask');
    setCurrentTask('mathTask');
  });

  const stableHandleHandTaskComplete = useRef(() => {
    console.log('[GlobalContext] HandTask completed - navigating to mathTask');
    setPreviousTask('handTask');
    setCurrentTask('mathTask');
  });

  const stableHandleHandTaskNext = useRef(() => {
    console.log('[GlobalContext] HandTask onNext - navigating to mathTask');
    setPreviousTask('handTask');
    setCurrentTask('mathTask');
  });

  const stableHandlePieRecallComplete = useRef(() => {
    console.log('[PIE RECALL] PieRecall completed - checking for pending phase transitions');
    
    // Check for pending phase transitions FIRST
    if (pendingPhaseChange !== null) {
      console.log(`[PIE RECALL] Pending phase change detected (${pendingPhaseChange}) - executing transition`);
      const phaseChanged = executePhaseTransition();
      console.log('[PIE RECALL] executePhaseTransition returned:', phaseChanged);
      if (phaseChanged) {
        console.log('[PIE RECALL] Phase transition completed - new phase will start');
        return; // Exit early, new phase will handle navigation
      }
    }
    
    // Normal navigation: move to next task in queue
    setCurrentTaskIndex((prevIndex: number) => {
      const nextIndex = prevIndex + 1;
      console.log(`[PIE RECALL] Moving from index ${prevIndex} to ${nextIndex}, queue length: ${taskQueue.length}`);
      if (nextIndex < taskQueue.length) {
        setCurrentTask(taskQueue[nextIndex]);
        return nextIndex;
      } else {
        // Queue completed - navigate to end phase
        console.log('[PIE RECALL] Queue completed, navigating to end phase');
        if (currentPhase === 3) {
          setCurrentTask('postGameMood');
        } else {
          setCurrentTask('results');
        }
        return prevIndex;
      }
    });
  });

  // Image preloading function
  const preloadImages = async () => {
    const imagePromises: Promise<void>[] = [];
    let loadedCount = 0;
    
    // Face images (Bild1-Bild69)
    const faceImages = Array.from({ length: 69 }, (_, i) => `Bild${i + 1}.webp`);
    
    // Faden images (Faden1-Faden6)
    const fadenImages = Array.from({ length: 6 }, (_, i) => `Faden${i + 1}.webp`);
    
    // Hand images (all combinations)
    const handTypes = ['Linksaussen', 'Linksinnen', 'Rechtsaussen', 'Rechtsinnen'];
    const handRotations = ['0', '90', '180', '270'];
    const handImages = handTypes.flatMap(type => 
      handRotations.map(rotation => `${type}_${rotation}.webp`)
    );
    
    const allImages = [...faceImages, ...fadenImages, ...handImages];
    const totalImages = allImages.length;
    
    console.log(`[PRELOAD] Starting to preload ${totalImages} images...`);
    setLoadingText(`Lade Bilder... (0/${totalImages})`);
    
    allImages.forEach((imageName) => {
      const promise = new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          loadedCount++;
          setLoadingProgress((loadedCount / totalImages) * 80); // 80% for images
          setLoadingText(`Lade Bilder... (${loadedCount}/${totalImages})`);
          resolve();
        };
        img.onerror = () => {
          console.warn(`[PRELOAD] Failed to load: ${imageName}`);
          loadedCount++;
          setLoadingProgress((loadedCount / totalImages) * 80);
          setLoadingText(`Lade Bilder... (${loadedCount}/${totalImages})`);
          resolve();
        };
        img.src = `/images/${imageName}`;
      });
      
      imagePromises.push(promise);
    });
    
    await Promise.all(imagePromises);
    console.log(`[PRELOAD] Successfully preloaded ${loadedCount}/${totalImages} images`);
  };

  // Stable wrapper components using useRef to prevent re-creation
  const stablePieTaskWrapper = useRef<React.ComponentType | null>(null);
  const stablePieRecallWrapper = useRef<React.ComponentType | null>(null);

  // Initialize wrapper components only once
  if (!stablePieTaskWrapper.current) {
    stablePieTaskWrapper.current = React.memo(() => {
      return (
        <PieTask 
          onComplete={stableHandlePieTaskComplete.current}
          onNext={stableHandlePieTaskNext.current}
          onDataUpdate={stableHandlePieDataUpdate.current}
        />
      );
    });
  }

  if (!stablePieRecallWrapper.current) {
    stablePieRecallWrapper.current = React.memo(() => {
      return (
        <PieRecall 
          onComplete={stableHandlePieRecallComplete.current}
          pieRotation={pieRotation}
          pieTargetSegments={pieTargetSegments}
        />
      );
    });
  }

  // ========================================
  // ALL EFFECTS AFTER FUNCTIONS
  // ========================================
  
  // App initialization
  useEffect(() => {
    const initializeApp = async () => {
      // Prevent multiple initializations
      if (appInitialized.current) {
        return;
      }
      appInitialized.current = true;
      
      try {
        setLoadingText('Initialisiere App...');
        setLoadingProgress(10);
        
        // CRUCIAL: Always start with fresh, empty taskStats
        console.log('[INIT] Resetting taskStats to ensure clean start');
        setTaskStats({});
        
        // ADDITIONAL: Clean any corrupted data from localStorage
        try {
          const savedSession = localStorage.getItem('currentSession');
          if (savedSession) {
            const sessionData = JSON.parse(savedSession);
            if (sessionData.taskStats) {
              // Check if taskStats contain unrealistic values (points instead of attempts)
              let hasCorruption = false;
              Object.entries(sessionData.taskStats).forEach(([taskType, stats]: [string, any]) => {
                if (stats && typeof stats.attempts === 'number' && stats.attempts > 50) {
                  console.warn(`[INIT] Found corrupted taskStats for ${taskType}: attempts=${stats.attempts} - clearing localStorage`);
                  hasCorruption = true;
                }
              });
              
              if (hasCorruption) {
                console.log('[INIT] Clearing corrupted localStorage session');
                localStorage.removeItem('currentSession');
              }
            }
          }
        } catch (error) {
          console.error('[INIT] Error checking localStorage:', error);
        }
        
        // Initialize task queue
        if (taskQueue.length === 0) {
          const initialQueue = generateTaskQueue(1);
          setTaskQueue(initialQueue);
          // Don't set currentTask yet - let StartScreen/MoodScreen handle navigation
          // setCurrentTask(initialQueue[0]);
          console.log('[INIT DEBUG] Initial Task Queue for Phase 1:', initialQueue);
        }
        setLoadingProgress(20);
        
        // Preload all images
        await preloadImages();
        setLoadingProgress(90);
        
        // Final setup
        setLoadingText('Fertigstellung...');
        await new Promise(resolve => setTimeout(resolve, 500)); // Brief pause for smooth UX
        setLoadingProgress(100);
        
        // Mark as fully loaded
        setTimeout(() => {
          setIsLoading(false);
          console.log('[INIT] App fully initialized and ready!');
        }, 200);
        
      } catch (error) {
        console.error('[INIT] Error during app initialization:', error);
        setLoadingText('Fehler beim Laden - App wird trotzdem gestartet...');
        setTimeout(() => setIsLoading(false), 1000);
      }
    };
    
    initializeApp();
  }, [generateTaskQueue]); // Only depend on generateTaskQueue, not on taskQueue which we modify inside

  // Reset pie data initialization when navigating away from pie tasks
  useEffect(() => {
    if (currentTask !== 'pieTask' && pieDataInitialized.current) {
      console.log('[GlobalContext] Resetting pie data initialization for new task:', currentTask);
      pieDataInitialized.current = false;
    }
  }, [currentTask]);

  // Phase Timer Effect - läuft normal runter, aber führt keine automatischen Aktionen durch
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isPhaseActive && phaseTimer > 0) {
      interval = setInterval(() => {
        setPhaseTimer(prev => {
          const newTime = prev - 1;
          
          // Timer läuft zu 0, aber keine automatischen Aktionen
          if (newTime <= 0) {
            console.log(`[TIMER DEBUG] Phase ${currentPhase} time is up - waiting for checkpoint`);
            return 0; // Stop timer at 0
          }
          
          // Log every 10 seconds in Phase 2 to track progress
          if (currentPhase === 2 && newTime % 10 === 0) {
            console.log(`[TIMER DEBUG] Phase 2 - ${Math.floor(newTime / 60)}:${String(newTime % 60).padStart(2, '0')} remaining`);
          }
          
          return newTime;
        });
      }, 1000); // Update every second
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPhaseActive, phaseTimer, currentPhase]);

  // Additional effect to mark phase transition as pending when timer reaches 0
  useEffect(() => {
    if (phaseTimer === 0 && isPhaseActive && pendingPhaseChange === null) {
      console.log(`[TIMER PENDING] Timer reached 0 for Phase ${currentPhase} - marking transition as pending until current task completes`);
      const nextPhase = currentPhase === 1 ? 2 : currentPhase === 2 ? 3 : null;
      if (nextPhase) {
        setPendingPhaseChange(nextPhase);
        console.log(`[TIMER PENDING] Phase transition to ${nextPhase} is now pending - will execute when task queue completes`);
        console.log(`[TIMER PENDING] Current task queue length: ${taskQueue.length}, current index: ${currentTaskIndex}`);
      } else {
        console.log('[TIMER PENDING] Phase 3 completed - session will end when task queue completes');
        setPendingPhaseChange(-1); // Special flag for session end
      }
    }
  }, [phaseTimer, isPhaseActive, currentPhase, pendingPhaseChange, taskQueue.length, currentTaskIndex]);
  
  // Memoize the context value to prevent unnecessary re-renders
  const contextValue: GlobalContextType = useMemo(() => ({
    // App loading
    isLoading,
    loadingProgress,
    loadingText,
    
    // Session management
    clientSessionId,
    
    // Math
    mathLevel,
    setMathLevel,
    mathStreak,
    setMathStreak,
    
    // Pie
    pieLevel,
    setPieLevel,
    pieStreak,
    setPieStreak,
    pieTargetSegments,
    setPieTargetSegments,
    pieRotation,
    setPieRotation,
    
    // Chess
    chessLevel,
    setChessLevel,
    chessStreak,
    setChessStreak,
    circlePositions,
    setCirclePositions,
    
    // Faden
    fadenLevel,
    setFadenLevel,
    fadenStreak,
    setFadenStreak,
    
    // Hand
    handLevel,
    setHandLevel,
    handStreak,
    setHandStreak,
    handData,
    setHandData,
    
    // Face1
    face1Level,
    setFace1Level,
    face1Streak,
    setFace1Streak,
    face1Data,
    setFace1Data,
    
    // Face2
    face2Level,
    setFace2Level,
    face2Streak,
    setFace2Streak,
    face2Data,
    setFace2Data,
    
    // Points
    totalPoints,
    setTotalPoints,
    addPoints,
    phaseResults,
    setPhaseResults,
    resetScoring,
    completePhase,
    phasePoints,
    addPhasePoints,
    
    // Navigation
    currentTask,
    setCurrentTask,
    nextTask,
    previousTask,
    setPreviousTask,
    navigateToNextTask,
    
    // Statistics
    trackTaskAttempt,
    reduceMathLevelOnError,
    resetTaskStats,
    taskStats,
    
    // Task Queue und Phase System
    taskQueue,
    setTaskQueue,
    currentTaskIndex,
    setCurrentTaskIndex,
    generateTaskQueue,
    currentPhase,
    setCurrentPhase,
    phaseTimer,
    setPhaseTimer,
    isPhaseActive,
    setIsPhaseActive,
    pendingPhaseChange,
    setPendingPhaseChange,
    executePhaseTransition,
    
    // Component wrappers - using stable refs to prevent re-creation
    PieTaskWrapper: stablePieTaskWrapper.current!,
    PieRecallWrapper: stablePieRecallWrapper.current!,
  }), [
    // Essential state values that components need to react to - but NOT phaseTimer!
    isLoading, loadingProgress, loadingText,
    currentTask, previousTask,
    currentPhase, currentTaskIndex,
    isPhaseActive, pendingPhaseChange
    // Excluded phaseTimer (would cause re-render every second)
    // Excluded level/streak values unless components specifically need them
  ]);

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
};

export { GlobalContext };

export const useGlobalContext = (): GlobalContextType => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobalContext must be used within a GlobalProvider');
  }
  return context;
};

export default GlobalProvider;