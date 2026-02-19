'use client';
import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { GlobalProvider, GlobalContext } from '../../context/GlobalContext';
import StartScreen from '../../components/StartScreen';
import MoodScreen from '../../components/MoodScreen';
import LanguageSelector from '../../components/LanguageSelector';
import PieTask from '../../components/PieTask';
import PieRecall from '../../components/PieRecall';
import ChessTask from '../../components/ChessTask';
import ChessRecall from '../../components/ChessRecall';
import HandTask from '../../components/HandTask';
import HandRecall from '../../components/HandRecall';
import ScoreDisplay from '../../components/ScoreDisplay';
import FadenTask from '../../components/FadenTask';
import Face1Task from '../../components/Face1Task';
import Face1Recall from '../../components/Face1Recall';
import Face2Task from '../../components/Face2Task';
import Face2Recall from '../../components/Face2Recall';
import MathTask from '../../components/MathTask';
import PostGameMoodScreen from '../../components/PostGameMoodScreen';
import Results from '../../components/Results';
import PhaseTimer from '../../components/PhaseTimer';
import DebugConsole from '../../components/DebugConsole';

// Import i18n configuration
import '../../config/i18n';

// Loading Indicator Component
function LoadingIndicator({ message }: { message: string }) {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-[#dfdfdfff] flex flex-col items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-lg text-gray-600">{message}</p>
        <p className="text-sm text-gray-400 mt-2">{t('common.loading')} GlobalContext...</p>
      </div>
    </div>
  );
}

// Task Wrappers mit GlobalContext Navigation
function MathTaskWrapper() {
  const context = useContext(GlobalContext);
  
  if (!context) return null;
  
  const { navigateToNextTask, mathLevel, trackTaskAttempt, addPoints, previousTask, setCurrentTask, setPreviousTask } = context;
  
  const handleMathComplete = (isCorrect: boolean) => {
    console.log('MathTask completed:', { isCorrect });
    
    // Track attempt in GlobalContext
    if (trackTaskAttempt) {
      trackTaskAttempt('mathTask', isCorrect);
    }
    
    // Add points to GlobalContext
    if (addPoints) {
      addPoints('mathTask', isCorrect);
    }
    
    // Navigate back to previous task or use normal navigation
    console.log('[MathTask DEBUG] About to check previousTask:', previousTask);
    console.log('[MathTask DEBUG] Type of previousTask:', typeof previousTask);
    console.log('[MathTask DEBUG] previousTask === null:', previousTask === null);
    console.log('[MathTask DEBUG] previousTask === undefined:', previousTask === undefined);
    
    if (previousTask) {
      console.log('[MathTask DEBUG] Previous task was:', previousTask);
      if (previousTask === 'pieTask') {
        console.log('[MathTask DEBUG] Completing PieTask → MathTask → PieRecall flow');
        setCurrentTask('pieRecall');
        setPreviousTask(null); // Clear previous task
      } else if (previousTask === 'chessTask') {
        console.log('[MathTask DEBUG] Completing ChessTask → MathTask → ChessRecall flow');
        setCurrentTask('chessRecall');
        setPreviousTask(null); // Clear previous task
      } else if (previousTask === 'handTask') {
        console.log('[MathTask DEBUG] Completing HandTask → MathTask → HandRecall flow');
        setCurrentTask('handRecall');
        setPreviousTask(null); // Clear previous task
      } else if (previousTask === 'fadenTask') {
        console.log('[MathTask DEBUG] Completing FadenTask → MathTask → FadenRecall flow');
        setCurrentTask('fadenRecall');
        setPreviousTask(null); // Clear previous task
      } else if (previousTask === 'face1Task') {
        console.log('[MathTask DEBUG] Completing Face1Task → MathTask → Face1Recall flow');
        setCurrentTask('face1Recall');
        setPreviousTask(null); // Clear previous task
      } else if (previousTask === 'face2Task') {
        console.log('[MathTask DEBUG] Returning to Face2Task for next round');
        setCurrentTask('face2Task');
        setPreviousTask(null); // Clear previous task
      } else {
        console.log('[MathTask DEBUG] Returning to previous task:', previousTask);
        setCurrentTask(previousTask);
        setPreviousTask(null); // Clear previous task
      }
    } else {
      console.log('[MathTask DEBUG] No previous task, using navigateToNextTask');
      navigateToNextTask();
    }
  };
  
  return (
    <div className="relative w-full h-full">
      <ScoreDisplay />
      <MathTask 
        onComplete={handleMathComplete}
        onBack={() => {}}
      />
    </div>
  );
}

function ChessTaskWrapper() {
  const context = useContext(GlobalContext);
  if (!context) return null;
  
  const handleComplete = () => {
    console.log('[Desktop] ChessTask completed - navigating to MathTask');
    context.setPreviousTask('chessTask');
    context.setCurrentTask('mathTask');
  };
  
  return (
    <div className="relative w-full h-full">
      <ScoreDisplay />
      <ChessTask onComplete={handleComplete} />
    </div>
  );
}

function ChessRecallWrapper() {
  const context = useContext(GlobalContext);
  if (!context) return null;
  
  const handleRecallComplete = () => {
    console.log('[ChessRecall] Recall completed - using navigateToNextTask');
    context.navigateToNextTask();
  };
  
  return (
    <div className="relative w-full h-full">
      <ScoreDisplay />
      <ChessRecall onComplete={handleRecallComplete} />
    </div>
  );
}

function HandTaskWrapper() {
  const context = useContext(GlobalContext);
  if (!context) return null;
  
  const handleComplete = () => {
    console.log('[Desktop] HandTask completed - navigating to MathTask');
    context.setPreviousTask('handTask');
    context.setCurrentTask('mathTask');
  };
  
  return (
    <div className="relative w-full h-full">
      <ScoreDisplay />
      <HandTask onComplete={handleComplete} />
    </div>
  );
}

function HandRecallWrapper() {
  const context = useContext(GlobalContext);
  if (!context) return null;
  
  const handleRecallComplete = () => {
    console.log('[HandRecall] Recall completed - using navigateToNextTask');
    context.navigateToNextTask();
  };
  
  return (
    <div className="relative w-full h-full">
      <ScoreDisplay />
      <HandRecall onComplete={handleRecallComplete} />
    </div>
  );
}

function FadenTaskWrapper() {
  const context = useContext(GlobalContext);
  if (!context) return null;
  
  // FadenTask is a special case - it navigates directly to next task without MathTask
  return (
    <div className="relative w-full h-full">
      <ScoreDisplay />
      <FadenTask />
    </div>
  );
}

function Face1TaskWrapper() {
  const context = useContext(GlobalContext);
  if (!context) return null;
  
  const { setPreviousTask, setCurrentTask } = context;
  
  const handleComplete = () => {
    console.log('[Face1TaskWrapper] Completing Face1Task → MathTask flow');
    setPreviousTask('face1Task');
    setCurrentTask('mathTask');
  };
  
  return (
    <div className="relative w-full h-full">
      <ScoreDisplay />
      <Face1Task onComplete={handleComplete} />
    </div>
  );
}

function Face1RecallWrapper() {
  const context = useContext(GlobalContext);
  if (!context) return null;
  
  return (
    <div className="relative w-full h-full">
      <ScoreDisplay />
      <Face1Recall />
    </div>
  );
}

function Face2TaskWrapper() {
  const context = useContext(GlobalContext);
  if (!context) return null;
  
  const { setPreviousTask, setCurrentTask } = context;
  
  const handleComplete = () => {
    console.log('[Face2TaskWrapper] Completing Face2Task → MathTask flow');
    setPreviousTask('face2Task');
    setCurrentTask('mathTask');
  };
  
  return (
    <div className="relative w-full h-full">
      <ScoreDisplay />
      <Face2Task onComplete={handleComplete} />
    </div>
  );
}

function Face2RecallWrapper() {
  const context = useContext(GlobalContext);
  if (!context) return null;
  
  return (
    <div className="relative w-full h-full">
      <ScoreDisplay />
      <Face2Recall />
    </div>
  );
}

// Context Status Checker mit vollständiger Initialisierung
function ContextChecker({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const context = useContext(GlobalContext);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!context) return;

    // Einfache Wartezeit für Context-Initialisierung
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [context]);

  if (!context) {
    return <LoadingIndicator message={t('common.loading')} />;
  }

  if (!isReady || !context.taskQueue || context.taskQueue.length === 0) {
    return (
      <div className="min-h-screen bg-[#dfdfdfff] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <>{children}</>;
}

// Desktop Navigation App - verwendet komplette GlobalContext Logik
// Wrapper Components outside of DesktopNavigationApp to prevent re-creation
const PieTaskWrapperComponent = React.memo(() => {
  const context = useContext(GlobalContext);
  if (!context) return null;
  
  // Use static handlers to avoid context dependency issues
  const handleComplete = () => {
    context.setPreviousTask('pieTask');
    context.setCurrentTask('mathTask');
  };

  const handleNext = () => {
    context.setPreviousTask('pieTask');
    context.setCurrentTask('mathTask');  
  };

  const handleDataUpdate = (rotation: number, segments: number[]) => {
    context.setPieRotation(rotation);
    context.setPieTargetSegments(segments);
  };
  
  return (
    <div className="relative w-full h-full">
      <ScoreDisplay />
      <PieTask 
        onComplete={handleComplete}
        onNext={handleNext}
        onDataUpdate={handleDataUpdate}
      />
    </div>
  );
});

const PieRecallWrapperComponent = React.memo(() => {
  const context = useContext(GlobalContext);
  if (!context) return null;
  
  const handleRecallComplete = () => {
    console.log('[PieRecall] Recall completed - using navigateToNextTask');
    // Use the standard navigation system which handles queue progression correctly
    context.navigateToNextTask();
  };
  
  return (
    <div className="relative w-full h-full">
      <ScoreDisplay />
      <PieRecall 
        onComplete={handleRecallComplete}
        pieRotation={context.pieRotation}
        pieTargetSegments={context.pieTargetSegments}
      />
    </div>
  );
});

function DesktopNavigationApp() {
  const { t, i18n } = useTranslation();
  const context = useContext(GlobalContext);
  const [appPhase, setAppPhase] = useState<'start' | 'mood' | 'tasks' | 'completed'>('start');
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showDebugConsole, setShowDebugConsole] = useState(false);

  if (!context) {
    return <LoadingIndicator message={t('common.loading')} />;
  }

  const {
    currentTask,
    setCurrentTask,
    taskQueue,
    currentTaskIndex,
    setCurrentTaskIndex,
    currentPhase,
    phaseTimer,
    isPhaseActive,
    setIsPhaseActive,
    setPhaseTimer,
    navigateToNextTask,
    totalPoints,
    pieRotation,
    pieTargetSegments
  } = context;

  const handleStart = () => {
    console.log('Starting app - initializing phase system');
    setIsPhaseActive(true);
    // Verwende die bereits im GlobalContext gesetzte Zeit (30 Sekunden für Phase 1)
    setAppPhase('mood');
  };

  const handleMoodContinue = async (data: { moodValue: number; mainSymptom: string; symptomIntensity: number; }) => {
    console.log('Mood data received:', data);
    console.log('[Desktop] navigateToNextTask available:', !!navigateToNextTask);
    console.log('[Desktop] taskQueue length:', taskQueue?.length || 0);
    console.log('[Desktop] First task in queue:', taskQueue?.[0] || 'none');
    
    // Create session with mood data
    try {
      // Debug: Check symptoms in database first
      const debugResponse = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'debug_symptoms' })
      });
      const debugResult = await debugResponse.json();
      console.log('[Desktop] Symptoms in database:', debugResult);
      
      const response = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_mood_session',
          moodVorher: data.moodValue,
          hauptsymptomKey: data.mainSymptom,
          symptomVorher: data.symptomIntensity
        })
      });
      
      const result = await response.json();
      if (response.ok && result.success) {
        // Store complete session data in localStorage
        const sessionData = {
          id: result.id,
          mood_vorher: data.moodValue,
          symptom: data.mainSymptom,
          symptom_intensity: data.symptomIntensity,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem('currentSession', JSON.stringify(sessionData));
        console.log('[Desktop] Session created and saved:', sessionData);
      } else {
        console.error('[Desktop] Failed to create session:', result.error);
      }
    } catch (error) {
      console.error('[Desktop] Error creating session:', error);
    }
    
    // Set the first task from the queue
    if (taskQueue && taskQueue.length > 0) {
      console.log('[Desktop] Setting currentTask to first task:', taskQueue[0]);
      setCurrentTask(taskQueue[0]);
      setCurrentTaskIndex(0);
    } else {
      console.error('[Desktop] No tasks in queue - cannot start');
    }
    
    setAppPhase('tasks');
  };

  const handleLanguagePress = () => {
    setShowLanguageSelector(true);
  };

  const handleLanguageSelect = (languageCode: string) => {
    console.log('Language selected:', languageCode);
    
    // Save selected language to localStorage
    try {
      localStorage.setItem('selectedLanguage', languageCode);
      console.log('Language saved to localStorage:', languageCode);
    } catch (error) {
      console.error('Failed to save language to localStorage:', error);
    }
    
    // Change language in i18n
    i18n.changeLanguage(languageCode);
  };

  // Start Screen
  if (appPhase === 'start') {
    return (
      <>
        <StartScreen 
          onStart={handleStart}
          onLanguagePress={handleLanguagePress}
        />
        <LanguageSelector
          isVisible={showLanguageSelector}
          onClose={() => setShowLanguageSelector(false)}
          onLanguageSelect={handleLanguageSelect}
        />
      </>
    );
  }

  // Mood Screen
  if (appPhase === 'mood') {
    return (
      <>
        <MoodScreen 
          onContinue={handleMoodContinue}
          onLanguagePress={handleLanguagePress}
        />
        <LanguageSelector
          isVisible={showLanguageSelector}
          onClose={() => setShowLanguageSelector(false)}
          onLanguageSelect={handleLanguageSelect}
        />
      </>
    );
  }

  // Completed Screen - nur wenn explizit 'completed' task gesetzt ist
  if (currentTask === 'completed') {
    return (
      <div className="min-h-screen bg-[#dfdfdfff] flex flex-col items-center justify-center px-8">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md w-full">
          <h1 className="text-3xl font-bold text-green-600 mb-6">🎉 Alle 3 Phasen abgeschlossen!</h1>
          <div className="text-xl font-bold text-blue-600 mb-4">Punkte: {totalPoints}</div>
          <div className="text-sm text-gray-600 mb-4">
            Phase {currentPhase} von 3 • {Math.floor((taskQueue.length - currentTaskIndex) / taskQueue.length * 100)}% abgeschlossen
          </div>
          <div className="text-xs text-gray-500 mb-4">
            Phase 1: 30s • Phase 2: 30s • Phase 3: 30s
          </div>
          <p className="text-lg text-gray-600 mb-8">Vielen Dank für die Teilnahme!</p>
          <button
            onClick={() => setAppPhase('start')}
            className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold"
          >
            Neu starten
          </button>
        </div>
      </div>
    );
  }

  // Tasks Phase - verwendet originale GlobalContext Navigation
  return (
    <div className="w-full h-screen relative">
      {/* Phase Timer */}
      {isPhaseActive && (
        <div className="absolute top-2 right-2 z-50">
          <PhaseTimer />
        </div>
      )}

      {/* Task Rendering - basiert auf currentTask aus GlobalContext */}
      {currentTask === 'pieTask' && <PieTaskWrapperComponent />}
      {currentTask === 'pieRecall' && <PieRecallWrapperComponent />}
      {currentTask === 'chessTask' && <ChessTaskWrapper />}
      {currentTask === 'chessRecall' && <ChessRecallWrapper />}
      {currentTask === 'handTask' && <HandTaskWrapper />}
      {currentTask === 'handRecall' && <HandRecallWrapper />}
      {currentTask === 'fadenTask' && <FadenTaskWrapper />}
      {currentTask === 'face1Task' && <Face1TaskWrapper />}
      {currentTask === 'face1Recall' && <Face1RecallWrapper />}
      {currentTask === 'face2Task' && <Face2TaskWrapper />}
      {currentTask === 'face2Recall' && <Face2RecallWrapper />}
      {currentTask === 'mathTask' && <MathTaskWrapper />}
      {currentTask === 'postGameMood' && <PostGameMoodScreen onComplete={(data) => {
        console.log('[DESKTOP] PostGameMoodScreen completed, navigating to Results');
        setCurrentTask('results');
      }} />}
      {currentTask === 'results' && <Results onComplete={() => {}} />}

      {/* Fallback für unbekannte Tasks */}
      {currentTask && !['pieTask', 'pieRecall', 'chessTask', 'chessRecall', 'handTask', 'handRecall', 'fadenTask', 'face1Task', 'face1Recall', 'face2Task', 'face2Recall', 'mathTask', 'postGameMood', 'results'].includes(currentTask) && (
        <div className="min-h-screen bg-[#dfdfdfff] flex flex-col items-center justify-center px-8">
          <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded max-w-md">
            <h3 className="font-bold">Unbekannte Aufgabe</h3>
            <p>Task: {currentTask}</p>
            <button
              onClick={navigateToNextTask}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
            >
              {t('moodScreen.continueButton')}
            </button>
          </div>
        </div>
      )}

      {/* Debug Console für Tablet-Debugging */}
      <DebugConsole 
        isVisible={showDebugConsole}
        onToggle={() => setShowDebugConsole(!showDebugConsole)}
      />
    </div>
  );
}

export default function DesktopPage() {
  return (
    <GlobalProvider>
      <ContextChecker>
        <DesktopNavigationApp />
      </ContextChecker>
    </GlobalProvider>
  );
}