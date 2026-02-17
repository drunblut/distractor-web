'use client';
import { useState } from 'react';

// Einfacher StartScreen ohne externe Abhängigkeiten
function SimpleStartScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen bg-[#dfdfdfff] flex flex-col items-center justify-center px-8">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Distractor Test
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Willkommen zur Android-Test-Version
        </p>
        <button
          onClick={onStart}
          className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white text-xl rounded-lg transition-colors font-bold"
        >
          App starten
        </button>
      </div>
    </div>
  );
}

// Einfacher MoodScreen
function SimpleMoodScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="min-h-screen bg-[#dfdfdfff] flex flex-col items-center justify-center px-8">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Wie fühlst du dich?
        </h2>
        <div className="space-y-4 mb-8">
          <button className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg">😊 Gut</button>
          <button className="w-full px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg">😐 Okay</button>
          <button className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg">😞 Schlecht</button>
        </div>
        <button
          onClick={onContinue}
          className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white text-xl rounded-lg transition-colors font-bold"
        >
          Weiter
        </button>
      </div>
    </div>
  );
}

// Einfache Task-Demo
function SimpleTask({ taskName, onNext }: { taskName: string; onNext: () => void }) {
  const [counter, setCounter] = useState(0);
  
  return (
    <div className="min-h-screen bg-[#dfdfdfff] flex flex-col items-center justify-center px-8">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {taskName}
        </h2>
        <p className="text-lg text-gray-600 mb-4">
          Test-Aufgabe: Klicke den Button!
        </p>
        <div className="text-3xl font-bold text-blue-500 mb-6">
          {counter}
        </div>
        <button
          onClick={() => setCounter(c => c + 1)}
          className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 text-white text-xl rounded-lg transition-colors font-bold mb-4"
        >
          Klick mich! ({counter})
        </button>
        <button
          onClick={onNext}
          className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white text-xl rounded-lg transition-colors font-bold"
        >
          Nächste Aufgabe
        </button>
      </div>
    </div>
  );
}

// Hauptkomponente ohne GlobalContext
export default function SimpleAndroidApp() {
  const [currentScreen, setCurrentScreen] = useState<'start' | 'mood' | 'task1' | 'task2' | 'completed'>('start');

  if (currentScreen === 'start') {
    return <SimpleStartScreen onStart={() => setCurrentScreen('mood')} />;
  }

  if (currentScreen === 'mood') {
    return <SimpleMoodScreen onContinue={() => setCurrentScreen('task1')} />;
  }

  if (currentScreen === 'task1') {
    return <SimpleTask taskName="Aufgabe 1" onNext={() => setCurrentScreen('task2')} />;
  }

  if (currentScreen === 'task2') {
    return <SimpleTask taskName="Aufgabe 2" onNext={() => setCurrentScreen('completed')} />;
  }

  if (currentScreen === 'completed') {
    return (
      <div className="min-h-screen bg-[#dfdfdfff] flex flex-col items-center justify-center px-8">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-green-600 mb-6">
            🎉 Fertig!
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Android-Test erfolgreich abgeschlossen!
          </p>
          <button
            onClick={() => setCurrentScreen('start')}
            className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white text-xl rounded-lg transition-colors font-bold"
          >
            Neu starten
          </button>
        </div>
      </div>
    );
  }

  return <div>Fehler: Unbekannter Screen</div>;
}