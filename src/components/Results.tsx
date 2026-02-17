'use client';
import React, { useContext, useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { GlobalContext } from '../context/GlobalContext';

interface ResultsProps {
  onComplete?: () => void;
}

export default function Results({ onComplete }: ResultsProps) {
  const contextValue = useContext(GlobalContext);
  const { 
    totalPoints,
    taskStats,
    setCurrentTask,
    currentPhase,
    phaseResults,
    resetScoring,
    setCurrentPhase,
    setTaskQueue,
    generateTaskQueue,
    setCurrentTaskIndex,
    phasePoints, // Use the new phase points system
    // Level states for detailed results
    mathLevel,
    pieLevel,
    chessLevel,
    fadenLevel,
    handLevel,
    face1Level,
    face2Level,
    // Streak information
    mathStreak,
    pieStreak,
    chessStreak,
    fadenStreak,
    handStreak,
    face1Streak,
    face2Streak
  } = contextValue || {};
  const { t } = useTranslation();

  if (!contextValue) {
    console.error('[Results] GlobalContext is undefined');
    return null;
  }

  // Calculate detailed results with levels and comprehensive stats
  const getTaskResults = () => {
    const results: Array<{
      name: string;
      attempts: number;
      correct: number;
      accuracy: string;
    }> = [];
    
    // Define task names matching the user request
    const taskTypes = [
      { key: 'mathTask', name: 'MathTask' },
      { key: 'pieTask', name: 'PieTask' },
      { key: 'chessTask', name: 'ChessTask' },
      { key: 'fadenTask', name: 'FadenTask' },
      { key: 'handTask', name: 'HandTask' },
      { key: 'face1Task', name: 'Face1Task' },
      { key: 'face2Task', name: 'Face2Task' }
    ];

    taskTypes.forEach(task => {
      const stats = taskStats?.[task.key];
      if (stats && stats.attempts > 0) {
        const accuracy = (stats.correct / stats.attempts * 100);
        
        results.push({
          name: task.name,
          attempts: stats.attempts,
          correct: stats.correct,
          accuracy: accuracy.toFixed(1)
        });
      }
    });
    
    return results;
  };

  // Calculate phase points from the new phase tracking system
  const getPhasePoints = () => {
    return [
      { phase: 'Phase 1', points: phasePoints?.[1] || 0 },
      { phase: 'Phase 2', points: phasePoints?.[2] || 0 },
      { phase: 'Phase 3', points: phasePoints?.[3] || 0 }
    ];
  };

  const taskResults = getTaskResults();
  const phasePointsArray = getPhasePoints();
  
  // Verify consistency between phase points and total points
  const calculatedTotal = phasePointsArray.reduce((sum, phase) => sum + phase.points, 0);
  const actualTotal = totalPoints || 0;
  
  if (Math.abs(calculatedTotal - actualTotal) > 1) {
    console.warn('[Results] Phase points inconsistency detected:', {
      phaseSum: calculatedTotal,
      actualTotal: actualTotal,
      difference: calculatedTotal - actualTotal
    });
  }
  
  // State for save status
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [savedResultId, setSavedResultId] = useState<number | null>(null);
  const hasSavedRef = useRef(false);

  // Function to mark session as completed
  const markSessionCompleted = async (sessionId: number) => {
    try {
      const response = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete_session',
          sessionId: sessionId
        })
      });
      
      if (response.ok) {
        console.log('[Results] Session marked as completed:', sessionId);
        // Clear localStorage session data
        localStorage.removeItem('currentSession');
      } else {
        console.error('[Results] Failed to mark session as completed');
      }
    } catch (error) {
      console.error('[Results] Error marking session completed:', error);
    }
  };

  // Function to save results to database
  const saveResultsToDatabase = async () => {
    if (saveStatus !== 'idle' || hasSavedRef.current) {
      console.log('[Results] Save skipped - already saved or in progress');
      return; // Prevent duplicate saves
    }
    
    hasSavedRef.current = true; // Mark as attempted
    setSaveStatus('saving');
    
    try {
      // Get current session from localStorage
      let currentSessionId: number | null = null;
      let moodData: any = {};
      const savedSession = localStorage.getItem('currentSession');
      if (savedSession) {
        try {
          const sessionData = JSON.parse(savedSession);
          currentSessionId = sessionData.id;
          // Extract mood and symptom data
          moodData = {
            mood_vorher: sessionData.mood_vorher,
            mood_nachher: sessionData.mood_nachher,
            hauptsymptom: sessionData.symptom,
            hauptsymptom_vorher: sessionData.symptom_intensity,
            hauptsymptom_nachher: sessionData.hauptsymptom_nachher
          };
          console.log('[Results] Extracted mood data from session:', moodData);
          console.log('[Results] SessionData debug:', {
            mood_nachher: sessionData.mood_nachher,
            hauptsymptom_nachher: sessionData.hauptsymptom_nachher
          });
        } catch (error) {
          console.error('[Results] Error parsing saved session:', error);
        }
      }

      // Calculate totals
      const totalAttempts = taskResults.reduce((sum, task) => sum + task.attempts, 0);
      const totalCorrect = taskResults.reduce((sum, task) => sum + task.correct, 0);
      const totalAccuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;
      
      // Extract individual task stats
      const getTaskData = (taskKey: string) => {
        const stats = taskStats?.[taskKey];
        if (stats && stats.attempts > 0) {
          return {
            attempts: stats.attempts,
            correct: stats.correct,
            accuracy: (stats.correct / stats.attempts) * 100
          };
        }
        return { attempts: 0, correct: 0, accuracy: 0.0 };
      };
      
      const resultsData = {
        // Mood and symptom data
        ...moodData,
        
        total_attempts: totalAttempts,
        total_correct: totalCorrect,
        total_accuracy: totalAccuracy,
        total_points: totalPoints || 0,
        
        // Individual task data
        ...Object.fromEntries(['math', 'pie', 'chess', 'faden', 'hand', 'face1', 'face2'].map(task => {
          const data = getTaskData(task + 'Task');
          return [
            [`${task}_attempts`, data.attempts],
            [`${task}_correct`, data.correct],
            [`${task}_accuracy`, data.accuracy]
          ];
        }).flat()),
        
        // Phase points
        phase1_points: phasePoints?.[1] || 0,
        phase2_points: phasePoints?.[2] || 0,
        phase3_points: phasePoints?.[3] || 0
      };
      
      console.log('[Results] Final results data being sent:', resultsData);
      
      let response, result;
      
      if (currentSessionId) {
        // Update existing session with game results
        console.log('[Results] Updating existing session:', currentSessionId, 'with results:', resultsData);
        response = await fetch('/api/results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update_game_results',
            sessionId: currentSessionId,
            results: resultsData
          })
        });
        
        result = await response.json();
        if (response.ok && result.success) {
          setSavedResultId(currentSessionId);
          console.log('[Results] Successfully updated session:', currentSessionId);
        }
      } else {
        // This should rarely happen - create new session if none exists
        console.warn('[Results] No existing session found, creating new one');
        response = await fetch('/api/results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'save_results',
            results: resultsData
          })
        });
        
        result = await response.json();
        if (response.ok && result.success) {
          setSavedResultId(result.id);
          currentSessionId = result.id;
        }
      }
      
      if (response.ok && result.success) {
        setSaveStatus('saved');
        console.log('[Results] Successfully saved with ID:', currentSessionId);
        
        // Mark session as completed and clean localStorage
        if (currentSessionId) {
          await markSessionCompleted(currentSessionId);
        }
        
      } else {
        throw new Error(result.error || 'Save failed');
      }
      
    } catch (error) {
      console.error('[Results] Save error:', error);
      setSaveStatus('error');
      hasSavedRef.current = false; // Reset on error to allow retry
    }
  };

  // Note: Database saving now happens after PostGameMood completion
  // This component only displays results - no automatic database save
  useEffect(() => {
    console.log('[Results] Results displayed - database save will happen after PostGameMood completion');
  }, [taskResults.length]); // Dependency on taskResults.length to ensure data is ready

  const handleRestart = () => {
    if (resetScoring) resetScoring();
    if (setCurrentPhase) setCurrentPhase(1);
    if (generateTaskQueue) generateTaskQueue();
    if (setCurrentTaskIndex) setCurrentTaskIndex(0);
    if (setCurrentTask) setCurrentTask('pieTask');
  };

  return (
    <div className="min-h-screen bg-[#dfdfdfff] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Distractor App Ergebnisse</h1>
          
          {/* Task Results Table */}
          <div className="mb-8">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Aufgabe</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Anzahl</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">davon korrekt</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">%</th>
                </tr>
              </thead>
              <tbody>
                {taskResults.map((task, index) => (
                  <tr key={task.name} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 font-medium">{task.name}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{task.attempts}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{task.correct}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{task.accuracy}%</td>
                  </tr>
                ))}
                {/* Gesamt row */}
                {taskResults.length > 0 && (
                  <tr className="bg-gray-100 border-t-2 border-gray-400">
                    <td className="border border-gray-300 px-4 py-2 font-bold">Gesamt</td>
                    <td className="border border-gray-300 px-4 py-2 text-center font-bold">
                      {taskResults.reduce((sum, task) => sum + task.attempts, 0)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center font-bold">
                      {taskResults.reduce((sum, task) => sum + task.correct, 0)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center font-bold">
                      {taskResults.length > 0 ? 
                        ((taskResults.reduce((sum, task) => sum + task.correct, 0) / 
                          taskResults.reduce((sum, task) => sum + task.attempts, 0)) * 100).toFixed(1) 
                        : '0.0'
                      }%
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Phase Points Table */}
          <div className="mb-8">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Phase</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Punkte</th>
                </tr>
              </thead>
              <tbody>
                {phasePointsArray.map((phase, index) => (
                  <tr key={phase.phase} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 font-medium">{phase.phase}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{phase.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mood and Symptom Data */}
          {(() => {
            const savedSession = localStorage.getItem('currentSession');
            let moodDisplayData = null;
            if (savedSession) {
              try {
                const sessionData = JSON.parse(savedSession);
                moodDisplayData = {
                  'Stimmung Anfang': sessionData.mood_vorher !== undefined ? `${sessionData.mood_vorher}/10` : 'Nicht erfasst',
                  'Stimmung Ende': sessionData.mood_nachher !== undefined ? `${sessionData.mood_nachher}/10` : 'Nicht erfasst',
                  'Hauptsymptom': sessionData.symptom ? t(`moodScreen.symptoms.${sessionData.symptom}`) : 'Nicht erfasst',
                  'Hauptsymptom Anfang': sessionData.symptom_intensity !== undefined ? `${sessionData.symptom_intensity}/10` : 'Nicht erfasst',
                  'Hauptsymptom Ende': sessionData.hauptsymptom_nachher !== undefined ? `${sessionData.hauptsymptom_nachher}/10` : 'Nicht erfasst'
                };
              } catch (error) {
                console.error('[Results] Error parsing session for mood display:', error);
              }
            }
            
            return moodDisplayData ? (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Stimmung & Symptome</h3>
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left">Messwert</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Wert</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(moodDisplayData).map(([label, value]) => (
                      <tr key={label} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2 font-medium">{label}</td>
                        <td className="border border-gray-300 px-4 py-2 text-center">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null;
          })()}

          {/* Total Score */}
          <div className="text-center mb-6">
            <div className="text-2xl font-bold text-gray-800">
              Gesamtscore: {totalPoints || 0}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRestart}
              className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold transition-colors"
            >
              Erneut spielen
            </button>
            <button
              onClick={() => window.location.href = '/desktop'}
              className="px-8 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-bold transition-colors"
            >
              Zurück zum Start
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}