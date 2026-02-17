'use client';
import { useState, useEffect } from 'react';

// Minimaler Context-freier Zustand
interface AppState {
  phase: 'loading' | 'start' | 'mood' | 'tasks' | 'completed';
  currentTask: number;
  score: number;
}

export default function MinimalAndroidApp() {
  const [state, setState] = useState<AppState>({
    phase: 'loading',
    currentTask: 0,
    score: 0
  });

  // Einfache Initialisierung ohne komplexen Context
  useEffect(() => {
    const timer = setTimeout(() => {
      setState(s => ({ ...s, phase: 'start' }));
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (state.phase === 'loading') {
    return (
      <div className="min-h-screen bg-[#dfdfdfff] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Lade App...</p>
        </div>
      </div>
    );
  }

  if (state.phase === 'start') {
    return (
      <div className="min-h-screen bg-[#dfdfdfff] flex flex-col items-center justify-center px-8">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md w-full">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Distractor Test
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Minimal-Version für Android
          </p>
          <button
            onClick={() => setState(s => ({ ...s, phase: 'mood' }))}
            className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white text-xl rounded-lg transition-colors font-bold"
          >
            Starten
          </button>
        </div>
      </div>
    );
  }

  if (state.phase === 'mood') {
    return (
      <div className="min-h-screen bg-[#dfdfdfff] flex flex-col items-center justify-center px-8">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Wie ist deine Stimmung?
          </h2>
          <div className="space-y-3 mb-8">
            {[
              { emoji: '😊', text: 'Sehr gut', value: 5 },
              { emoji: '🙂', text: 'Gut', value: 4 },
              { emoji: '😐', text: 'Neutral', value: 3 },
              { emoji: '🙁', text: 'Schlecht', value: 2 },
              { emoji: '😞', text: 'Sehr schlecht', value: 1 }
            ].map((mood) => (
              <button
                key={mood.value}
                onClick={() => setState(s => ({ ...s, phase: 'tasks' }))}
                className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg flex items-center justify-center space-x-2"
              >
                <span className="text-2xl">{mood.emoji}</span>
                <span>{mood.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (state.phase === 'tasks') {
    const tasks = ['Pie-Aufgabe', 'Schach-Aufgabe', 'Hand-Aufgabe'];
    const currentTaskName = tasks[state.currentTask] || 'Unbekannte Aufgabe';
    
    return (
      <div className="min-h-screen bg-[#dfdfdfff] flex flex-col items-center justify-center px-8">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md w-full">
          <div className="mb-4">
            <div className="text-sm text-gray-500">
              Aufgabe {state.currentTask + 1} von {tasks.length}
            </div>
            <div className="text-sm text-blue-600 font-bold">
              Score: {state.score}
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {currentTaskName}
          </h2>
          
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((state.currentTask + 1) / tasks.length) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <p className="text-lg text-gray-600 mb-8">
            Simuliere Task-Ausführung...
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => setState(s => ({ ...s, score: s.score + 10 }))}
              className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold"
            >
              Richtig (+10 Punkte)
            </button>
            
            <button
              onClick={() => setState(s => ({ ...s, score: s.score + 5 }))}
              className="w-full px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-bold"
            >
              Teilweise richtig (+5 Punkte)
            </button>
            
            <button
              onClick={() => {
                if (state.currentTask < tasks.length - 1) {
                  setState(s => ({ ...s, currentTask: s.currentTask + 1 }));
                } else {
                  setState(s => ({ ...s, phase: 'completed' }));
                }
              }}
              className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold"
            >
              Nächste Aufgabe
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (state.phase === 'completed') {
    return (
      <div className="min-h-screen bg-[#dfdfdfff] flex flex-col items-center justify-center px-8">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md w-full">
          <h2 className="text-3xl font-bold text-green-600 mb-6">
            🎉 Abgeschlossen!
          </h2>
          <div className="text-2xl font-bold text-blue-600 mb-4">
            Endscore: {state.score}
          </div>
          <p className="text-lg text-gray-600 mb-8">
            Alle Aufgaben erfolgreich bearbeitet!
          </p>
          <button
            onClick={() => setState({ phase: 'start', currentTask: 0, score: 0 })}
            className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white text-xl rounded-lg transition-colors font-bold"
          >
            Neu starten
          </button>
        </div>
      </div>
    );
  }

  return <div>Fehler: Unbekannter Zustand</div>;
}