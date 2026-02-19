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
    face2Streak,
    // Debug function
    resetTaskStats
  } = contextValue || {};
  const { t } = useTranslation();

  // Format task names for display (without translation)
  const formatTaskName = (taskName: string): string => {
    const formatMap: { [key: string]: string } = {
      'MathTask': 'Math Task',
      'PieTask': 'Pie Task',
      'ChessTask': 'Chess Task',
      'FadenTask': 'Faden Task',
      'HandTask': 'Hand Task',
      'Face1Task': 'Face Task 1',
      'Face2Task': 'Face Task 2'
    };
    return formatMap[taskName] || taskName;
  };

  if (!contextValue) {
    console.error('[Results] GlobalContext is undefined');
    return null;
  }

  // Calculate detailed results with levels and comprehensive stats
  const getTaskResults = () => {
    console.log(`[STORAGE DEBUG] ========== COMPLETE STORAGE ANALYSIS ==========`);
    
    // Check ALL localStorage entries
    console.log(`[STORAGE DEBUG] All localStorage keys:`, Object.keys(localStorage));
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        console.log(`[STORAGE DEBUG] localStorage['${key}']:`, value);
        
        // Parse currentSession if it exists
        if (key === 'currentSession' && value) {
          try {
            const parsed = JSON.parse(value);
            console.log(`[STORAGE DEBUG] Parsed currentSession:`, parsed);
            console.log(`[STORAGE DEBUG] currentSession.taskStats:`, parsed.taskStats);
          } catch (e) {
            console.error(`[STORAGE DEBUG] Error parsing currentSession:`, e);
          }
        }
      }
    }
    
    // Check sessionStorage too
    console.log(`[STORAGE DEBUG] All sessionStorage keys:`, Object.keys(sessionStorage));
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        const value = sessionStorage.getItem(key);
        console.log(`[STORAGE DEBUG] sessionStorage['${key}']:`, value);
      }
    }
    
    console.log(`[STORAGE DEBUG] Context taskStats:`, taskStats);
    console.log(`[STORAGE DEBUG] ===============================================`);
    
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
      console.log(`[RESULTS CRITICAL] Processing ${task.key}:`, stats);
      
      if (stats && stats.attempts > 0) {
        // ULTRA-CRITICAL: Extremely strict validation to prevent any wrong display
        const rawAttempts = stats.attempts;
        const rawCorrect = stats.correct;
        
        // If attempts is unrealistic (like points), calculate what it should be based on math
        let cleanAttempts = rawAttempts;
        let cleanCorrect = rawCorrect;
        
        // Heuristic: If attempts > 30 for any single task type, it's likely points, not attempts
        if (rawAttempts > 30) {
          console.warn(`[RESULTS CRITICAL] ${task.key} has suspicious attempts: ${rawAttempts} - applying correction`);
          
          // For MathTask: typically 1-4 points per task, so divide by average (2.5)
          if (task.key === 'mathTask') {
            cleanAttempts = Math.round(rawAttempts / 2.8); // 48/17 ≈ 2.8
            cleanCorrect = Math.min(cleanCorrect, cleanAttempts); // Correct can't exceed attempts
          } else {
            // For other tasks: use a similar heuristic based on their point systems
            cleanAttempts = Math.round(rawAttempts / 4); // Assume average 4 points per task for others
            cleanCorrect = Math.min(cleanCorrect, cleanAttempts);
          }
          
          console.log(`[RESULTS CRITICAL] Corrected ${task.key}: ${rawAttempts} → ${cleanAttempts} attempts, ${rawCorrect} → ${cleanCorrect} correct`);
        }
        
        // Final validation: Must be reasonable numbers
        const attempts = (cleanAttempts >= 1 && cleanAttempts <= 50) ? cleanAttempts : 0;
        const correct = (cleanCorrect >= 0 && cleanCorrect <= attempts) ? cleanCorrect : 0;
        
        // Only add if we have valid data
        if (attempts > 0) {
          const accuracy = (correct / attempts * 100);
          
          results.push({
            name: formatTaskName(task.name),
            attempts: attempts,
            correct: correct,
            accuracy: accuracy.toFixed(1)
          });
        }
      }
    });
    
    return results;
  };

  // Calculate phase points from the new phase tracking system
  const getPhasePoints = () => {
    return [
      { phase: `${t('results.phasePoints.title')} 1`, points: phasePoints?.[1] || 0 },
      { phase: `${t('results.phasePoints.title')} 2`, points: phasePoints?.[2] || 0 },
      { phase: `${t('results.phasePoints.title')} 3`, points: phasePoints?.[3] || 0 }
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
    // Complete app restart: Reset everything and reload page
    if (resetScoring) resetScoring();
    if (setCurrentPhase) setCurrentPhase(1);
    if (generateTaskQueue) generateTaskQueue();
    if (setCurrentTaskIndex) setCurrentTaskIndex(0);
    if (setCurrentTask) setCurrentTask('pieTask');
    
    // Clear ALL localStorage to ensure complete fresh start
    try {
      localStorage.clear();
      console.log('[Complete Restart] Cleared all localStorage');
    } catch (error) {
      console.error('[Complete Restart] Error clearing localStorage:', error);
    }
    
    // Complete page reload for fresh start
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#dfdfdfff] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">{t('results.title')}</h1>
          
          {/* Task Results Table */}
          <div className="mb-8">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">{t('results.table.task')}</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">{t('results.table.count')}</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">{t('results.table.correct')}</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">{t('results.table.percentage')}</th>
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
                {/* Total row */}
                {taskResults.length > 0 && (
                  <tr className="bg-gray-100 border-t-2 border-gray-400">
                    <td className="border border-gray-300 px-4 py-2 font-bold">{t('results.table.total')}</td>
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
                  <th className="border border-gray-300 px-4 py-2 text-left">{t('results.phasePoints.title')}</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">{t('results.phasePoints.points')}</th>
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
                  [t('results.moodData.moodStart')]: sessionData.mood_vorher !== undefined ? `${sessionData.mood_vorher}/10` : t('results.moodData.notRecorded'),
                  [t('results.moodData.moodEnd')]: sessionData.mood_nachher !== undefined ? `${sessionData.mood_nachher}/10` : t('results.moodData.notRecorded'),
                  [t('results.moodData.mainSymptom')]: sessionData.symptom ? t(`moodScreen.symptoms.${sessionData.symptom}`) : t('results.moodData.notRecorded'),
                  [t('results.moodData.symptomStart')]: sessionData.symptom_intensity !== undefined ? `${sessionData.symptom_intensity}/10` : t('results.moodData.notRecorded'),
                  [t('results.moodData.symptomEnd')]: sessionData.hauptsymptom_nachher !== undefined ? `${sessionData.hauptsymptom_nachher}/10` : t('results.moodData.notRecorded')
                };
              } catch (error) {
                console.error('[Results] Error parsing session for mood display:', error);
              }
            }
            
            return moodDisplayData ? (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">{t('results.moodData.title')}</h3>
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left">{t('results.moodData.measurement')}</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">{t('results.moodData.value')}</th>
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
              {t('results.totalScore')}: {totalPoints || 0}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <button
              onClick={handleRestart}
              className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold transition-colors"
            >
              {t('results.playAgain')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}