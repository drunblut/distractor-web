'use client';
import { useState, useEffect, useContext } from 'react';
import { GlobalProvider, GlobalContext } from '../../context/GlobalContext';
import StartScreen from '../../components/StartScreen';
import MoodScreen from '../../components/MoodScreen';
import MathTask from '../../components/MathTask';
import PhaseTimer from '../../components/PhaseTimer';

// Vereinfachte PieTask mit expliziter Navigation
function SimplePieTask({ onComplete }: { onComplete: () => void }) {
  const [memorized, setMemorized] = useState(false);
  const [completed, setCompleted] = useState(false);
  
  const handleNext = () => {
    console.log('PieTask completed, calling onComplete');
    onComplete();
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-8 bg-[#dfdfdfff]">
      <div className="bg-[#dfdfdfff] p-4 sm:p-8 max-w-lg w-full">
        <p className="text-base sm:text-lg font-semibold text-gray-800 text-center mb-4 sm:mb-6">
          {!memorized ? "Merke dir die roten Segmente!" : "Wo waren die roten Segmente?"}
        </p>
        
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="w-64 h-64 relative">
            {/* Vereinfachtes Pie Chart */}
            <svg width="256" height="256" className="border-2 border-gray-300 rounded-full">
              <circle cx="128" cy="128" r="120" fill="#e5e7eb" stroke="#6b7280" strokeWidth="2"/>
              {/* Rote Segmente */}
              <path d="M 128 128 L 128 8 A 120 120 0 0 1 248 128 Z" fill="#ef4444"/>
              <path d="M 128 128 L 248 128 A 120 120 0 0 1 128 248 Z" fill="#ef4444"/>
              {/* Separatorlinien */}
              <line x1="128" y1="128" x2="128" y2="8" stroke="white" strokeWidth="3"/>
              <line x1="128" y1="128" x2="248" y2="128" stroke="white" strokeWidth="3"/>
              <line x1="128" y1="128" x2="128" y2="248" stroke="white" strokeWidth="3"/>
              <line x1="128" y1="128" x2="8" y2="128" stroke="white" strokeWidth="3"/>
            </svg>
          </div>
        </div>
        
        <div className="flex justify-center space-x-4">
          {!memorized ? (
            <button
              onClick={() => setMemorized(true)}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium text-sm sm:text-base"
            >
              Eingeprägt
            </button>
          ) : (
            <>
              <button
                onClick={handleNext}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium text-sm sm:text-base"
              >
                Weiter
              </button>
              <button
                onClick={() => setMemorized(false)}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium text-sm sm:text-base"
              >
                Nochmal
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Andere Tasks für die Sequenz
function SimpleTask({ name, icon, onComplete }: { name: string; icon: string; onComplete: () => void }) {
  return (
    <div className="min-h-screen bg-[#dfdfdfff] flex flex-col items-center justify-center px-8">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {icon} {name}
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Task-Demo für Android-Test
        </p>
        <button
          onClick={onComplete}
          className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold"
        >
          Abschließen
        </button>
      </div>
    </div>
  );
}

// Hauptapp mit direkter Task-Navigation
function DirectNavigationApp() {
  const [appPhase, setAppPhase] = useState<'start' | 'mood' | 'tasks' | 'completed'>('start');
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [mathStats, setMathStats] = useState({
    level: 1, streak: 0, correctCount: 0, totalScore: 0, totalCorrect: 0, totalAttempts: 0
  });

  const tasks = [
    { name: 'Pie-Aufgabe', type: 'pie-task', icon: '🥧' },
    { name: 'Pie-Wiederholung', type: 'pie-recall', icon: '🔄' },
    { name: 'Schach-Aufgabe', type: 'chess-task', icon: '♟️' },
    { name: 'Schach-Wiederholung', type: 'chess-recall', icon: '♻️' },
    { name: 'Mathe-Aufgabe', type: 'math', icon: '🧮' },
  ];

  const handleStart = () => {
    console.log('Start pressed');
    setAppPhase('mood');
  };

  const handleMoodContinue = (moodValue: number) => {
    console.log('Mood continue:', moodValue);
    setAppPhase('tasks');
  };

  const handleTaskComplete = () => {
    console.log(`Task ${currentTaskIndex} completed`);
    setScore(prev => prev + 10);
    
    if (currentTaskIndex < tasks.length - 1) {
      setCurrentTaskIndex(prev => prev + 1);
    } else {
      setAppPhase('completed');
    }
  };

  const handleMathComplete = (stats: any) => {
    console.log('Math completed:', stats);
    setMathStats(stats);
    setScore(prev => prev + (stats.totalScore || 0));
    handleTaskComplete();
  };

  // Start Screen
  if (appPhase === 'start') {
    return (
      <StartScreen 
        onStart={handleStart}
        onLanguagePress={() => console.log('Language pressed')}
      />
    );
  }

  // Mood Screen
  if (appPhase === 'mood') {
    return (
      <MoodScreen 
        onContinue={handleMoodContinue}
        onLanguagePress={() => console.log('Language pressed')}
      />
    );
  }

  // Completed Screen
  if (appPhase === 'completed') {
    return (
      <div className="min-h-screen bg-[#dfdfdfff] flex flex-col items-center justify-center px-8">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md w-full">
          <h1 className="text-3xl font-bold text-green-600 mb-6">🎉 Fertig!</h1>
          <div className="text-xl font-bold text-blue-600 mb-4">Score: {score}</div>
          <p className="text-lg text-gray-600 mb-8">Alle {tasks.length} Aufgaben abgeschlossen!</p>
          <button
            onClick={() => {
              setAppPhase('start');
              setCurrentTaskIndex(0);
              setScore(0);
              setMathStats({ level: 1, streak: 0, correctCount: 0, totalScore: 0, totalCorrect: 0, totalAttempts: 0 });
            }}
            className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold"
          >
            Neu starten
          </button>
        </div>
      </div>
    );
  }

  // Tasks Phase
  const currentTask = tasks[currentTaskIndex];
  
  return (
    <div className="w-full h-screen">
      {/* Progress Info */}
      <div className="absolute top-2 left-2 z-50 bg-black bg-opacity-75 text-white text-xs p-2 rounded">
        <div>Aufgabe: {currentTaskIndex + 1}/{tasks.length}</div>
        <div>Aktuell: {currentTask.name}</div>
        <div>Score: {score}</div>
        <div>Phase: {appPhase}</div>
      </div>

      {/* Render Current Task */}
      {currentTask.type === 'pie-task' && (
        <SimplePieTask onComplete={handleTaskComplete} />
      )}
      
      {currentTask.type === 'math' && (
        <MathTask 
          onComplete={handleMathComplete}
          onBack={() => {}}
          initialLevel={mathStats.level}
          initialStats={mathStats}
        />
      )}
      
      {!['pie-task', 'math'].includes(currentTask.type) && (
        <SimpleTask 
          name={currentTask.name} 
          icon={currentTask.icon} 
          onComplete={handleTaskComplete} 
        />
      )}
    </div>
  );
}

export default function DirectNavigationPage() {
  return (
    <GlobalProvider>
      <DirectNavigationApp />
    </GlobalProvider>
  );
}