'use client';
import { useEffect, useState } from 'react';
import StartScreen from '../components/StartScreen';
import MoodScreen from '../components/MoodScreen';
import MathTask from '../components/MathTask';
import PieTask from '../components/PieTask';
import PieRecall from '../components/PieRecall';
import ChessTask from '../components/ChessTask';
import ChessRecall from '../components/ChessRecall';
import LoadingScreen from '../components/LoadingScreen';
import { MathProblem, MathTaskStats } from '../utils/mathUtils';
import { GlobalProvider } from '../context/GlobalContext';
import '../config/i18n';

type CurrentView = 'start' | 'mood' | 'math' | 'pie-task' | 'pie-recall' | 'chess-task' | 'chess-recall' | 'tasks';
type NavigationFlow = 'pie-flow' | 'chess-flow';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <GlobalProvider>
      <HomeContent />
    </GlobalProvider>
  );
}

// Separate component that uses GlobalContext
function HomeContent() {
  const [currentView, setCurrentView] = useState<CurrentView>('start');
  const [navigationFlow, setNavigationFlow] = useState<NavigationFlow>('pie-flow');
  const [mathStats, setMathStats] = useState<MathTaskStats>({
    level: 1,
    streak: 0,
    correctCount: 0,
    totalScore: 0,
    totalCorrect: 0,
    totalAttempts: 0
  });
  const [mathTaskKey, setMathTaskKey] = useState(0); // Force re-render with new problem
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  // Show loading screen during initial app load
  if (isLoading) {
    return <LoadingScreen onLoadingComplete={handleLoadingComplete} />;
  }

  const handleStart = () => {
    console.log('App started, navigating to mood screen...');
    setCurrentView('mood');
  };

  const handleMoodContinue = (data: { moodValue: number; mainSymptom: string; symptomIntensity: number }) => {
    console.log('Mood data:', data);
    setCurrentView('pie-task');
  };

  const handleMathComplete = (isCorrect: boolean) => {
    console.log('Math completed:', isCorrect);
    
    // Navigate based on current flow
    setTimeout(() => {
      if (navigationFlow === 'pie-flow') {
        setCurrentView('pie-recall');
      } else {
        setCurrentView('chess-recall');
      }
    }, 100);
  };

  const handleLanguagePress = () => {
    console.log('Language selection requested');
    alert('Sprachauswahl - noch nicht implementiert');
  };

  const handleBackToStart = () => {
    setCurrentView('start');
    // Reset stats when going back to start
    setMathStats({
      level: 1,
      streak: 0,
      correctCount: 0,
      totalScore: 0,
      totalCorrect: 0,
      totalAttempts: 0
    });
  };

  const handleBackToMood = () => {
    setCurrentView('mood');
  };

  const handleBackToPieTask = () => {
    setCurrentView('pie-task');
  };

  const handlePieTaskComplete = () => {
    setNavigationFlow('pie-flow');
    setCurrentView('math');
    setMathTaskKey(prev => prev + 1); // Force new problem
  };

  const handlePieRecallComplete = () => {
    setCurrentView('chess-task');
  };

  const handleChessTaskComplete = () => {
    setNavigationFlow('chess-flow');
    setCurrentView('math');
    setMathTaskKey(prev => prev + 1); // Force new problem
  };

  const handleChessRecallComplete = () => {
    setCurrentView('tasks');
  };

  const handleBackToMath = () => {
    setCurrentView('math');
    setMathTaskKey(prev => prev + 1); // Force new problem
  };

  return (
    <div className="w-full h-screen">
      {currentView === 'start' && (
        <StartScreen 
          onStart={handleStart}
          onLanguagePress={handleLanguagePress}
        />
      )}
        
        {currentView === 'mood' && (
          <div className="relative w-full h-full">
            <button
              className="absolute top-4 left-4 z-10 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              onClick={handleBackToStart}
            >
              ← Start
            </button>
            <MoodScreen 
              onContinue={handleMoodContinue}
              onLanguagePress={handleLanguagePress}
            />
          </div>
        )}
        
        {currentView === 'math' && (
          <MathTask 
            key={mathTaskKey}
            onComplete={handleMathComplete}
            onBack={handleBackToMood}
          />
        )}
        
        {currentView === 'pie-task' && (
          <div className="relative w-full h-full">
            <button
              className="absolute top-4 left-4 z-10 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              onClick={handleBackToMood}
            >
              ← Zurück
            </button>
            <PieTask 
              onComplete={handlePieTaskComplete} 
              onNext={handlePieTaskComplete} 
            />
          </div>
        )}
        
        {currentView === 'pie-recall' && (
          <div className="relative w-full h-full">
            <button
              className="absolute top-4 left-4 z-10 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              onClick={handleBackToPieTask}
            >
              ← Zurück
            </button>
            <PieRecall onComplete={handlePieRecallComplete} />
          </div>
        )}
        
        {currentView === 'chess-task' && (
          <div className="relative w-full h-full">
            <button
              className="absolute top-4 left-4 z-10 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              onClick={handleBackToMath}
            >
              ← Zurück
            </button>
            <ChessTask onComplete={handleChessTaskComplete} />
          </div>
        )}
        
        {currentView === 'chess-recall' && (
          <div className="relative w-full h-full">
            <button
              className="absolute top-4 left-4 z-10 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              onClick={() => setCurrentView('chess-task')}
            >
              ← Zurück
            </button>
            <ChessRecall />
          </div>
        )}
        
        {currentView === 'chess-task' && (
          <div className="relative w-full h-full">
            <button
              className="absolute top-4 left-4 z-10 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              onClick={handleBackToMath}
            >
              ← Zurück
            </button>
            <ChessTask onComplete={handleChessTaskComplete} />
          </div>
        )}
        
        {currentView === 'chess-recall' && (
          <div className="relative w-full h-full">
            <button
              className="absolute top-4 left-4 z-10 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              onClick={() => setCurrentView('chess-task')}
            >
              ← Zurück
            </button>
            <ChessRecall />
          </div>
        )}
        
        {currentView === 'tasks' && (
          <div className="flex flex-col items-center justify-center h-full bg-[#dfdfdfff] px-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
              Alle Aufgaben abgeschlossen! 🎉
            </h1>
            <div className="text-xl text-green-600 font-bold mb-2">
              Aktueller Score: {mathStats.totalScore} {mathStats.totalScore === 1 ? 'Punkt' : 'Punkte'}
            </div>
            <div className="text-lg text-gray-600 mb-8">
              Level: {mathStats.level} | Erfolgsrate: {mathStats.totalAttempts > 0 ? ((mathStats.totalCorrect / mathStats.totalAttempts) * 100).toFixed(1) : '0.0'}%
            </div>
            
            <div className="flex gap-4">
              <button
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                onClick={handleBackToMath}
              >
                Noch eine Aufgabe
              </button>
              <button
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                onClick={handleBackToStart}
              >
                Zurück zum Start
              </button>
            </div>
            
            <p className="text-sm text-gray-500 text-center mt-6 max-w-md">
              Sie haben erfolgreich PieTask und ChessTask absolviert! Der Aufgabenflow ist: Mood → PieTask → Math → PieRecall → ChessTask → ChessRecall → Fertig
            </p>
          </div>
        )}
      </div>
    );
}