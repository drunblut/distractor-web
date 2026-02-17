'use client';
import { useState } from 'react';
import StartScreen from '../../components/StartScreen';
import MoodScreen from '../../components/MoodScreen';

// Vereinfachte Task-Komponenten ohne GlobalContext
function SimplePieTask({ onComplete }: { onComplete: () => void }) {
  const [memorized, setMemorized] = useState(false);
  
  return (
    <div className="min-h-screen bg-[#dfdfdfff] flex flex-col items-center justify-center px-8">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          🥧 Pie-Aufgabe
        </h2>
        
        {!memorized ? (
          <>
            <p className="text-lg text-gray-600 mb-6">
              Merke dir die roten Segmente in diesem Kreis!
            </p>
            <div className="w-48 h-48 mx-auto mb-6 bg-blue-200 rounded-full relative flex items-center justify-center">
              <div className="w-16 h-16 bg-red-500 absolute -top-2"></div>
              <div className="w-16 h-16 bg-red-500 absolute -right-2"></div>
              <div className="text-gray-700 font-bold">Pie Chart</div>
            </div>
            <button
              onClick={() => setMemorized(true)}
              className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold"
            >
              Eingeprägt - Weiter
            </button>
          </>
        ) : (
          <>
            <p className="text-lg text-gray-600 mb-6">
              Wo waren die roten Segmente?
            </p>
            <div className="w-48 h-48 mx-auto mb-6 bg-blue-200 rounded-full relative flex items-center justify-center">
              <div className="text-gray-700 font-bold">Wähle Segmente</div>
            </div>
            <button
              onClick={onComplete}
              className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold"
            >
              Aufgabe abschließen
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function SimplePieRecall({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="min-h-screen bg-[#dfdfdfff] flex flex-col items-center justify-center px-8">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          🔄 Pie-Wiederholung
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Wiederhole die Pie-Aufgabe
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

function SimpleChessTask({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="min-h-screen bg-[#dfdfdfff] flex flex-col items-center justify-center px-8">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          ♟️ Schach-Aufgabe
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Merke dir die Positionen der Schachfiguren
        </p>
        <div className="grid grid-cols-3 gap-2 w-48 h-48 mx-auto mb-6">
          <div className="bg-white border-2 border-gray-300 flex items-center justify-center">♜</div>
          <div className="bg-gray-200 border-2 border-gray-300"></div>
          <div className="bg-white border-2 border-gray-300 flex items-center justify-center">♜</div>
          <div className="bg-gray-200 border-2 border-gray-300"></div>
          <div className="bg-white border-2 border-gray-300 flex items-center justify-center">♚</div>
          <div className="bg-gray-200 border-2 border-gray-300"></div>
          <div className="bg-white border-2 border-gray-300"></div>
          <div className="bg-gray-200 border-2 border-gray-300"></div>
          <div className="bg-white border-2 border-gray-300"></div>
        </div>
        <button
          onClick={onComplete}
          className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold"
        >
          Eingeprägt - Weiter
        </button>
      </div>
    </div>
  );
}

function SimpleChessRecall({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="min-h-screen bg-[#dfdfdfff] flex flex-col items-center justify-center px-8">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          ♟️ Schach-Wiederholung
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Setze die Figuren an die richtige Position
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

function SimpleTask({ name, icon, onComplete }: { name: string; icon: string; onComplete: () => void }) {
  return (
    <div className="min-h-screen bg-[#dfdfdfff] flex flex-col items-center justify-center px-8">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {icon} {name}
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Vereinfachte Version für Android-Kompatibilität
        </p>
        <button
          onClick={onComplete}
          className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold"
        >
          Aufgabe abschließen
        </button>
      </div>
    </div>
  );
}

function SimpleMathTask({ onComplete }: { onComplete: (stats: any) => void }) {
  const [problem, setProblem] = useState({ a: 5, b: 3, answer: 8 });
  const [userAnswer, setUserAnswer] = useState('');
  
  return (
    <div className="min-h-screen bg-[#dfdfdfff] flex flex-col items-center justify-center px-8">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          🧮 Mathe-Aufgabe
        </h2>
        <div className="text-3xl font-bold text-blue-600 mb-4">
          {problem.a} + {problem.b} = ?
        </div>
        <input
          type="number"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg mb-4 text-center text-xl"
          placeholder="Antwort eingeben"
        />
        <button
          onClick={() => {
            const stats = { level: 1, totalScore: userAnswer === '8' ? 10 : 0 };
            onComplete(stats);
          }}
          className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold"
        >
          Antwort bestätigen
        </button>
      </div>
    </div>
  );
}

// Task Queue ohne GlobalContext
const TASK_SEQUENCE = [
  'pieTask', 'pieRecall',
  'chessTask', 'chessRecall', 
  'fadenTask',
  'face1Task', 'face1Recall',
  'handTask', 'handRecall',
  'mathTask'
];

interface AppState {
  phase: 'start' | 'mood' | 'tasks' | 'completed';
  currentTaskIndex: number;
  score: number;
  mathStats: {
    level: number;
    streak: number;
    correctCount: number;
    totalScore: number;
    totalCorrect: number;
    totalAttempts: number;
  };
}

export default function AndroidCompatibleApp() {
  const [state, setState] = useState<AppState>({
    phase: 'start',
    currentTaskIndex: 0,
    score: 0,
    mathStats: {
      level: 1,
      streak: 0,
      correctCount: 0,
      totalScore: 0,
      totalCorrect: 0,
      totalAttempts: 0
    }
  });

  const currentTask = TASK_SEQUENCE[state.currentTaskIndex];

  const handleStart = () => {
    console.log('Start pressed');
    setState(s => ({ ...s, phase: 'mood' }));
  };

  const handleMoodContinue = (moodValue: number) => {
    console.log('Mood:', moodValue);
    setState(s => ({ ...s, phase: 'tasks' }));
  };

  const handleTaskComplete = () => {
    console.log(`Task ${currentTask} completed`);
    
    if (state.currentTaskIndex < TASK_SEQUENCE.length - 1) {
      setState(s => ({ ...s, currentTaskIndex: s.currentTaskIndex + 1, score: s.score + 10 }));
    } else {
      setState(s => ({ ...s, phase: 'completed' }));
    }
  };

  const handleMathComplete = (stats: any) => {
    console.log('Math completed with stats:', stats);
    setState(s => ({ 
      ...s, 
      mathStats: stats,
      score: s.score + stats.totalScore 
    }));
    handleTaskComplete();
  };

  // Start Screen
  if (state.phase === 'start') {
    return (
      <StartScreen 
        onStart={handleStart}
        onLanguagePress={() => console.log('Language pressed')}
      />
    );
  }

  // Mood Screen  
  if (state.phase === 'mood') {
    return (
      <MoodScreen 
        onContinue={handleMoodContinue}
        onLanguagePress={() => console.log('Language pressed')}
      />
    );
  }

  // Tasks
  if (state.phase === 'tasks') {
    return (
      <div className="w-full h-screen">
        {/* Progress Info */}
        <div className="absolute top-2 left-2 z-50 bg-black bg-opacity-75 text-white text-xs p-2 rounded">
          <div>Task: {state.currentTaskIndex + 1}/{TASK_SEQUENCE.length}</div>
          <div>Current: {currentTask}</div>
          <div>Score: {state.score}</div>
        </div>

        {/* Render Current Task */}
        {currentTask === 'pieTask' && <SimplePieTask onComplete={handleTaskComplete} />}
        {currentTask === 'pieRecall' && <SimplePieRecall onComplete={handleTaskComplete} />}
        {currentTask === 'chessTask' && <SimpleChessTask onComplete={handleTaskComplete} />}
        {currentTask === 'chessRecall' && <SimpleChessRecall onComplete={handleTaskComplete} />}
        {currentTask === 'fadenTask' && <SimpleTask name="Faden-Aufgabe" icon="🧵" onComplete={handleTaskComplete} />}
        {currentTask === 'face1Task' && <SimpleTask name="Gesicht-Aufgabe" icon="👤" onComplete={handleTaskComplete} />}
        {currentTask === 'face1Recall' && <SimpleTask name="Gesicht-Wiederholung" icon="👁️" onComplete={handleTaskComplete} />}
        {currentTask === 'handTask' && <SimpleTask name="Hand-Aufgabe" icon="✋" onComplete={handleTaskComplete} />}
        {currentTask === 'handRecall' && <SimpleTask name="Hand-Wiederholung" icon="👋" onComplete={handleTaskComplete} />}
        {currentTask === 'mathTask' && <SimpleMathTask onComplete={handleMathComplete} />}
      </div>
    );
  }

  // Completed
  if (state.phase === 'completed') {
    return (
      <div className="min-h-screen bg-[#dfdfdfff] flex flex-col items-center justify-center px-8">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md w-full">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            🎉 Alle Aufgaben abgeschlossen!
          </h1>
          <div className="text-xl text-green-600 font-bold mb-2">
            Gesamtscore: {state.score}
          </div>
          <div className="text-lg text-gray-600 mb-8">
            {TASK_SEQUENCE.length} Aufgaben erfolgreich bearbeitet
          </div>
          <button
            className="w-full px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white text-xl rounded-lg transition-colors font-bold"
            onClick={() => setState({
              phase: 'start',
              currentTaskIndex: 0,
              score: 0,
              mathStats: {
                level: 1,
                streak: 0,
                correctCount: 0,
                totalScore: 0,
                totalCorrect: 0,
                totalAttempts: 0
              }
            })}
          >
            Neu starten
          </button>
        </div>
      </div>
    );
  }

  return <div>Fehler: Unbekannter Zustand</div>;
}