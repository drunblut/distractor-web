'use client';
import { useEffect, useState, useContext } from 'react';
import { GlobalProvider, GlobalContext } from '../../context/GlobalContext';
import StartScreen from '../../components/StartScreen';
import MoodScreen from '../../components/MoodScreen';
import MathTask from '../../components/MathTask';
import PieTask from '../../components/PieTask';
import PieRecall from '../../components/PieRecall';
import ChessTask from '../../components/ChessTask';
import ChessRecall from '../../components/ChessRecall';
import FadenTask from '../../components/FadenTask';
import Face1Task from '../../components/Face1Task';
import Face1Recall from '../../components/Face1Recall';
import Face2Task from '../../components/Face2Task';
import Face2Recall from '../../components/Face2Recall';
import HandTask from '../../components/HandTask';
import HandRecall from '../../components/HandRecall';
import ScoreDisplay from '../../components/ScoreDisplay';
import PostGameMoodScreen from '../../components/PostGameMoodScreen';
import Results from '../../components/Results';
import PhaseTimer from '../../components/PhaseTimer';
import '../../config/i18n';

function TaskQueueApp() {
  const [mounted, setMounted] = useState(false);
  const [appPhase, setAppPhase] = useState<'start' | 'mood' | 'tasks'>('start');
  const [mathStats, setMathStats] = useState({
    level: 1,
    streak: 0,
    correctCount: 0,
    totalScore: 0,
    totalCorrect: 0,
    totalAttempts: 0
  });
  const [mathTaskKey, setMathTaskKey] = useState(0);

  // Get context values
  const {
    currentTask,
    taskQueue,
    currentTaskIndex,
    currentPhase,
    phaseTimer,
    isPhaseActive,
    navigateToNextTask
  } = useContext(GlobalContext) || {};

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#dfdfdfff]">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  // Determine current view based on app phase and current task
  const getCurrentView = () => {
    if (appPhase === 'start') return 'start';
    if (appPhase === 'mood') return 'mood';
    
    if (appPhase === 'tasks' && currentTask) {
      switch (currentTask) {
        case 'pieTask': return 'pie-task';
        case 'pieRecall': return 'pie-recall';
        case 'chessTask': return 'chess-task';
        case 'chessRecall': return 'chess-recall';
        case 'fadenTask': return 'faden-task';
        case 'face1Task': return 'face1-task';
        case 'face1Recall': return 'face1-recall';      case 'face2Task': return 'face2-task';
      case 'face2Recall': return 'face2-recall';        case 'handTask': return 'hand-task';
        case 'handRecall': return 'hand-recall';
        case 'mathTask': return 'math';
        case 'postGameMood': return 'post-game-mood';
        case 'results': return 'results';
        case 'completed': return 'tasks';
        default: return 'pie-task';
      }
    }
    
    return 'start';
  };

  const currentView = getCurrentView();

  const handleStart = () => {
    console.log('Start button clicked, navigating to mood screen...');
    setAppPhase('mood');
  };

  const handleLanguagePress = () => {
    console.log('Language pressed');
  };

  const handleMoodContinue = async (data: { moodValue: number; mainSymptom: string; symptomIntensity: number }) => {
    console.log('Mood continue pressed with data:', data);
    
    try {
      // Create session in database with initial mood data
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
        // Save session data to localStorage
        const sessionData = {
          id: result.id,
          mood_vorher: data.moodValue,
          symptom: data.mainSymptom,
          symptom_intensity: data.symptomIntensity,
          created_at: new Date().toISOString()
        };
        localStorage.setItem('currentSession', JSON.stringify(sessionData));
        console.log('[AndroidApp] Session created:', sessionData);
        
        // Navigate to tasks
        setAppPhase('tasks');
      } else {
        console.error('[AndroidApp] Failed to create session:', result.error);
        // Still proceed to tasks even if database fails
        setAppPhase('tasks');
      }
    } catch (error) {
      console.error('[AndroidApp] Error creating session:', error);
      // Still proceed to tasks even if database fails
      setAppPhase('tasks');
    }
  };

  const handleMathComplete = (stats: any) => {
    setMathStats(stats);
    console.log('Math task completed with stats:', stats);
    setMathTaskKey(prev => prev + 1);
  };

  const handlePieTaskComplete = () => {
    console.log('PieTask completed - navigation handled by task queue');
  };

  const handlePieRecallComplete = () => {
    console.log('PieRecall completed - navigation handled by task queue');
  };

  const handleChessTaskComplete = () => {
    console.log('ChessTask completed - navigation handled by task queue');
  };

  const handleChessRecallComplete = () => {
    console.log('ChessRecall completed - navigation handled by task queue');
  };

  const handleFadenTaskComplete = () => {
    console.log('FadenTask completed - navigation handled by task queue');
  };

  const handleFace1TaskComplete = () => {
    console.log('Face1Task completed - navigation handled by task queue');
  };

  const handleFace1RecallComplete = () => {
    console.log('Face1Recall completed - navigation handled by task queue');
  };

  const handleFace2TaskComplete = () => {
    console.log('Face2Task completed - navigation handled by task queue');
  };

  const handleFace2RecallComplete = () => {
    console.log('Face2Recall completed - navigation handled by task queue');
  };

  const handleHandTaskComplete = () => {
    console.log('HandTask completed - navigation handled by task queue');
  };

  const handleHandRecallComplete = () => {
    console.log('HandRecall completed - navigation handled by task queue');
  };

  const handlePostGameMoodComplete = async (data: { moodNachher: number; symptomIntensityNachher: number }) => {
    console.log('[AndroidApp] PostGameMoodScreen completed with data:', data);
    
    try {
      // Update session in database with post-game mood data
      const savedSession = localStorage.getItem('currentSession');
      if (savedSession) {
        const sessionData = JSON.parse(savedSession);
        
        const response = await fetch('/api/results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update_mood_nachher',
            sessionId: sessionData.id,
            moodNachher: data.moodNachher,
            symptomNachher: data.symptomIntensityNachher
          })
        });
        
        const result = await response.json();
        if (response.ok && result.success) {
          console.log('[AndroidApp] Successfully updated post-game mood data');
          // Update localStorage
          sessionData.mood_nachher = data.moodNachher;
          sessionData.symptom_nachher = data.symptomIntensityNachher;
          localStorage.setItem('currentSession', JSON.stringify(sessionData));
        } else {
          console.error('[AndroidApp] Failed to update post-game mood:', result.error);
        }
      }
    } catch (error) {
      console.error('[AndroidApp] Error updating post-game mood:', error);
    }
    
    // Navigate to results after mood data is captured
    if (navigateToNextTask) {
      navigateToNextTask();
    }
  };

  return (
    <div className="w-full h-screen">
      {/* Phase Timer - only show during tasks phase */}
      {appPhase === 'tasks' && <PhaseTimer />}
      
      {/* Debug Info */}
      {appPhase === 'tasks' && (
        <div className="absolute top-2 left-2 z-50 bg-black bg-opacity-75 text-white text-xs p-2 rounded">
          <div>Phase: {currentPhase}</div>
          <div>Task: {currentTask}</div>
          <div>Queue: {currentTaskIndex}/{(taskQueue || []).length}</div>
          <div>Active: {isPhaseActive ? 'Yes' : 'No'}</div>
          <div>Timer: {Math.floor((phaseTimer || 0) / 60)}:{((phaseTimer || 0) % 60).toString().padStart(2, '0')}</div>
        </div>
      )}

      {currentView === 'start' && (
        <StartScreen 
          onStart={handleStart}
          onLanguagePress={handleLanguagePress}
        />
      )}
      
      {currentView === 'mood' && (
        <MoodScreen 
          onContinue={handleMoodContinue}
          onLanguagePress={handleLanguagePress}
        />
      )}
      
      {currentView === 'math' && (
        <div className="relative w-full h-full">
          <ScoreDisplay />
          <MathTask 
            key={mathTaskKey}
            onComplete={handleMathComplete}
            onBack={() => {}}
            initialLevel={mathStats.level}
            initialStats={mathStats}
          />
        </div>
      )}
      
      {currentView === 'pie-task' && (
        <div className="relative w-full h-full">
          <ScoreDisplay />
          <PieTask onComplete={handlePieTaskComplete} />
        </div>
      )}
      
      {currentView === 'pie-recall' && (
        <div className="relative w-full h-full">
          <ScoreDisplay />
          <PieRecall onComplete={handlePieRecallComplete} />
        </div>
      )}
      
      {currentView === 'chess-task' && (
        <div className="relative w-full h-full">
          <ScoreDisplay />
          <ChessTask onComplete={handleChessTaskComplete} />
        </div>
      )}
      
      {currentView === 'chess-recall' && (
        <div className="relative w-full h-full">
          <ScoreDisplay />
          <ChessRecall onComplete={handleChessRecallComplete} />
        </div>
      )}
      
      {currentView === 'faden-task' && (
        <div className="relative w-full h-full">
          <ScoreDisplay />
          <FadenTask onComplete={handleFadenTaskComplete} />
        </div>
      )}
      
      {currentView === 'face1-task' && (
        <div className="relative w-full h-full">
          <ScoreDisplay />
          <Face1Task onComplete={handleFace1TaskComplete} />
        </div>
      )}
      
      {currentView === 'face1-recall' && (
        <div className="relative w-full h-full">
          <ScoreDisplay />
          <Face1Recall onComplete={handleFace1RecallComplete} />
        </div>
      )}
      
      {currentView === 'face2-task' && (
        <div className="relative w-full h-full">
          <ScoreDisplay />
          <Face2Task onComplete={handleFace2TaskComplete} />
        </div>
      )}
      
      {currentView === 'face2-recall' && (
        <div className="relative w-full h-full">
          <ScoreDisplay />
          <Face2Recall onComplete={handleFace2RecallComplete} />
        </div>
      )}
      
      {currentView === 'hand-task' && (
        <div className="relative w-full h-full">
          <ScoreDisplay />
          <HandTask onComplete={handleHandTaskComplete} />
        </div>
      )}
      
      {currentView === 'hand-recall' && (
        <div className="relative w-full h-full">
          <ScoreDisplay />
          <HandRecall onComplete={handleHandRecallComplete} />
        </div>
      )}

      {currentView === 'post-game-mood' && (
        <PostGameMoodScreen onComplete={handlePostGameMoodComplete} />
      )}

      {currentView === 'results' && (
        <Results />
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
            Phase {currentPhase} von 3 - {(taskQueue || []).length} Aufgaben in der Queue
          </div>
          <button
            className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white text-xl rounded-lg transition-colors font-bold"
            onClick={() => window.location.reload()}
          >
            Neu starten
          </button>
        </div>
      )}
    </div>
  );
}

export default function AndroidPage() {
  return (
    <GlobalProvider>
      <TaskQueueApp />
    </GlobalProvider>
  );
}