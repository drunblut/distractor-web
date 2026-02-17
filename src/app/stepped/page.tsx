'use client';
import { useState, useEffect } from 'react';
import { GlobalProvider } from '../../context/GlobalContext';

// Lazy loading wrapper für GlobalContext
function LazyGlobalProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [loadingStep, setLoadingStep] = useState<'context' | 'complete'>('context');

  useEffect(() => {
    // Schritt 1: GlobalContext initialisieren (mit Delay für Android)
    const timer1 = setTimeout(() => {
      setLoadingStep('complete');
      
      // Schritt 2: Komplett bereit
      const timer2 = setTimeout(() => {
        setIsReady(true);
      }, 300);
      
      return () => clearTimeout(timer2);
    }, 500);
    
    return () => clearTimeout(timer1);
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-[#dfdfdfff] flex flex-col items-center justify-center px-8">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Lade Distractor App
          </h2>
          <p className="text-gray-600">
            {loadingStep === 'context' ? 'Initialisiere Context...' : 'Fast fertig...'}
          </p>
        </div>
      </div>
    );
  }

  return <GlobalProvider>{children}</GlobalProvider>;
}

// Hauptkomponente die original Components verwendet
function OriginalAppWithDelayedContext() {
  return <OriginalDistractorApp />;
}

// Die echte App mit allen original Komponenten
function OriginalDistractorApp() {
  // Hier importieren wir dynamisch zur Laufzeit
  const [components, setComponents] = useState<any>(null);
  
  useEffect(() => {
    // Dynamischer Import der Components für bessere Performance
    Promise.all([
      import('../../components/StartScreen'),
      import('../../components/MoodScreen'),
      import('../../components/PieTask'),
      import('../../components/PieRecall'),
      import('../../components/ChessTask'),
      import('../../components/ChessRecall'),
      import('../../components/FadenTask'),
      import('../../components/Face1Task'),
      import('../../components/Face1Recall'),
      import('../../components/HandTask'),
      import('../../components/HandRecall'),
      import('../../components/MathTask'),
      import('../../components/PhaseTimer'),
    ]).then(([
      StartScreen,
      MoodScreen,
      PieTask,
      PieRecall,
      ChessTask,
      ChessRecall,
      FadenTask,
      Face1Task,
      Face1Recall,
      HandTask,
      HandRecall,
      MathTask,
      PhaseTimer,
    ]) => {
      setComponents({
        StartScreen: StartScreen.default,
        MoodScreen: MoodScreen.default,
        PieTask: PieTask.default,
        PieRecall: PieRecall.default,
        ChessTask: ChessTask.default,
        ChessRecall: ChessRecall.default,
        FadenTask: FadenTask.default,
        Face1Task: Face1Task.default,
        Face1Recall: Face1Recall.default,
        HandTask: HandTask.default,
        HandRecall: HandRecall.default,
        MathTask: MathTask.default,
        PhaseTimer: PhaseTimer.default,
      });
    });
  }, []);

  if (!components) {
    return (
      <div className="min-h-screen bg-[#dfdfdfff] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Komponenten...</p>
        </div>
      </div>
    );
  }

  return <TaskQueueAppWithComponents components={components} />;
}

// Die eigentliche App Logic
function TaskQueueAppWithComponents({ components }: { components: any }) {
  const [mounted, setMounted] = useState(false);
  const [appPhase, setAppPhase] = useState<'start' | 'mood' | 'tasks'>('start');

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 200);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#dfdfdfff] flex items-center justify-center">
        <div className="text-xl text-gray-600">Starte App...</div>
      </div>
    );
  }

  const handleStart = () => {
    console.log('Start pressed - navigating to mood');
    setAppPhase('mood');
  };

  const handleMoodContinue = (moodValue: number) => {
    console.log('Mood continue with value:', moodValue);
    setAppPhase('tasks');
  };

  // Start Screen mit original Komponente
  if (appPhase === 'start') {
    return (
      <components.StartScreen 
        onStart={handleStart}
        onLanguagePress={() => console.log('Language pressed')}
      />
    );
  }

  // Mood Screen mit original Komponente  
  if (appPhase === 'mood') {
    return (
      <components.MoodScreen 
        onContinue={handleMoodContinue}
        onLanguagePress={() => console.log('Language pressed')}
      />
    );
  }

  // Tasks mit original GlobalContext Logic
  if (appPhase === 'tasks') {
    return <TaskPhaseWithOriginalComponents components={components} />;
  }

  return <div>Fehler: Unbekannter Zustand</div>;
}

// Task Phase mit original Komponenten und GlobalContext
function TaskPhaseWithOriginalComponents({ components }: { components: any }) {
  // Hier verwenden wir useContext um auf den vollständigen GlobalContext zuzugreifen
  const React = require('react');
  const { GlobalContext } = require('../../context/GlobalContext');
  
  const contextValue = React.useContext(GlobalContext);
  const {
    currentView,
    currentTask,
    taskQueue,
    currentTaskIndex,
    currentPhase,
    phaseTimer,
    isPhaseActive,
    mathTaskKey,
    mathStats,
  } = contextValue || {};

  // Render original Komponenten basierend auf currentView
  const renderCurrentView = () => {
    switch (currentView) {
      case 'math':
        return (
          <components.MathTask 
            key={mathTaskKey}
            onComplete={() => {}}
            onBack={() => {}}
            initialLevel={mathStats?.level || 1}
            initialStats={mathStats}
          />
        );
      case 'pie-task':
        return <components.PieTask />;
      case 'pie-recall':
        return <components.PieRecall />;
      case 'chess-task':
        return <components.ChessTask />;
      case 'chess-recall':
        return <components.ChessRecall />;
      case 'faden-task':
        return <components.FadenTask />;
      case 'face1-task':
        return <components.Face1Task />;
      case 'face1-recall':
        return <components.Face1Recall />;
      case 'hand-task':
        return <components.HandTask />;
      case 'hand-recall':
        return <components.HandRecall />;
      case 'tasks':
        return (
          <div className="flex flex-col items-center justify-center h-full bg-[#dfdfdfff] px-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
              Alle Aufgaben abgeschlossen! 🎉
            </h1>
            <div className="text-xl text-green-600 font-bold mb-2">
              Aktueller Score: {mathStats?.totalScore || 0}
            </div>
            <div className="text-lg text-gray-600 mb-8">
              Phase {currentPhase} von 3 - {(taskQueue || []).length} Aufgaben
            </div>
            <button
              className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white text-xl rounded-lg transition-colors font-bold"
              onClick={() => window.location.reload()}
            >
              Neu starten
            </button>
          </div>
        );
      default:
        return <components.PieTask />;
    }
  };

  return (
    <div className="w-full h-screen">
      {/* Original Timer */}
      <components.PhaseTimer />
      
      {/* Debug Info */}
      <div className="absolute top-2 left-2 z-50 bg-black bg-opacity-75 text-white text-xs p-2 rounded">
        <div>View: {currentView}</div>
        <div>Task: {currentTask}</div>
        <div>Queue: {currentTaskIndex}/{(taskQueue || []).length}</div>
        <div>Phase: {currentPhase}</div>
        <div>Timer: {Math.floor((phaseTimer || 0) / 60)}:{((phaseTimer || 0) % 60).toString().padStart(2, '0')}</div>
      </div>

      {/* Render Current View */}
      {renderCurrentView()}
    </div>
  );
}

export default function SteppedLoadingApp() {
  return (
    <LazyGlobalProvider>
      <OriginalAppWithDelayedContext />
    </LazyGlobalProvider>
  );
}