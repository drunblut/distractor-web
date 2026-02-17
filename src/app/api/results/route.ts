import { NextRequest, NextResponse } from 'next/server';
import { saveGameResults, getAllResults, updateMoodAndSymptoms, GameResults, getSymptomIdByKey, getAllSymptoms, markSessionCompleted, markSessionAbandoned, cleanupOldActiveSessions, getSessionStats, getCompletedResults, updateGameResults, createMoodSession } from '../../../lib/database';

// Simple in-memory session storage for this demo
// In production, use proper session management
let currentSessionId: number | null = null;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'save_results': {
        const gameResults: GameResults = data.results;
        const resultId = saveGameResults(gameResults);
        currentSessionId = resultId; // Store for future updates
        return NextResponse.json({ success: true, id: resultId });
      }

      case 'update_game_results': {
        const { sessionId, results } = data;
        if (!sessionId) {
          return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
        }
        
        const changes = updateGameResults(sessionId, results);
        return NextResponse.json({ success: true, changes });
      }

      case 'save_initial_mood': {
        const { moodVorher } = data;
        // Create a minimal initial entry
        const initialResults: GameResults = {
          total_attempts: 0,
          total_correct: 0,
          total_accuracy: 0,
          total_points: 0
        };
        const initialId = saveGameResults(initialResults);
        currentSessionId = initialId;
        
        // Update with mood
        updateMoodAndSymptoms(initialId, moodVorher);
        return NextResponse.json({ success: true, id: initialId });
      }

      case 'create_mood_session': {
        try {
          const { moodVorher, hauptsymptomKey, symptomVorher } = data;
          console.log('[API] create_mood_session called with:', { moodVorher, hauptsymptomKey, symptomVorher });
          
          let hauptsymptomId: number | undefined = undefined;
          if (hauptsymptomKey) {
            const symptomId = getSymptomIdByKey(hauptsymptomKey);
            console.log('[API] getSymptomIdByKey result for', hauptsymptomKey, ':', symptomId);
            if (symptomId === null) {
              console.warn('[API] Symptom not found in database:', hauptsymptomKey, '- proceeding with null');
              // Don't fail, just proceed with null symptom
              hauptsymptomId = undefined;
            } else {
              hauptsymptomId = symptomId;
            }
          }
          
          const sessionId = createMoodSession(moodVorher, hauptsymptomId, symptomVorher);
          currentSessionId = sessionId;
          
          console.log('[API] Created mood session:', sessionId, 'with mood:', moodVorher, 'symptom:', hauptsymptomKey, 'intensity:', symptomVorher);
          return NextResponse.json({ success: true, id: sessionId });
        } catch (error) {
          console.error('[API] Error in create_mood_session:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return NextResponse.json({ error: 'Database operation failed', details: errorMessage }, { status: 500 });
        }
      }

      case 'debug_symptoms': {
        try {
          const allSymptoms = getAllSymptoms();
          console.log('[API] All symptoms in database:', allSymptoms);
          return NextResponse.json({ success: true, symptoms: allSymptoms });
        } catch (error) {
          console.error('[API] Error getting symptoms:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return NextResponse.json({ error: errorMessage }, { status: 500 });
        }
      }

      case 'save_symptom': {
        const { hauptsymptomKey } = data;
        if (!currentSessionId) {
          return NextResponse.json({ error: 'No active session' }, { status: 400 });
        }
        
        const hauptsymptomId = getSymptomIdByKey(hauptsymptomKey);
        if (hauptsymptomId === null) {
          return NextResponse.json({ error: 'Invalid symptom key' }, { status: 400 });
        }
        
        updateMoodAndSymptoms(currentSessionId, undefined, undefined, hauptsymptomId);
        return NextResponse.json({ success: true });
      }

      case 'save_intensity': {
        const { hauptsymptomVorher } = data;
        if (!currentSessionId) {
          return NextResponse.json({ error: 'No active session' }, { status: 400 });
        }
        
        updateMoodAndSymptoms(currentSessionId, undefined, undefined, undefined, hauptsymptomVorher);
        return NextResponse.json({ success: true });
      }

      case 'update_mood_nachher': {
        const { sessionId, moodNachher, symptomNachher } = data;
        if (!sessionId) {
          return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
        }
        
        console.log('[API] update_mood_nachher called with:', { sessionId, moodNachher, symptomNachher });
        
        try {
          // Update only mood_nachher and hauptsymptom_nachher fields
          const changes = updateMoodAndSymptoms(sessionId, undefined, moodNachher, undefined, undefined, symptomNachher);
          console.log('[API] Successfully updated post-game mood data for session:', sessionId);
          return NextResponse.json({ success: true, changes });
        } catch (error) {
          console.error('[API] Error updating post-game mood:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return NextResponse.json({ error: 'Database update failed', details: errorMessage }, { status: 500 });
        }
      }

      case 'update_mood_symptoms': {
        const { id, moodVorher, moodNachher, hauptsymptomKey, symptomVorher, symptomNachher } = data;
        let hauptsymptomId: number | undefined = undefined;
        
        if (hauptsymptomKey) {
          const symptomId = getSymptomIdByKey(hauptsymptomKey);
          if (symptomId === null) {
            return NextResponse.json({ error: 'Invalid symptom key' }, { status: 400 });
          }
          hauptsymptomId = symptomId;
        }
        
        const changes = updateMoodAndSymptoms(id, moodVorher, moodNachher, hauptsymptomId, symptomVorher, symptomNachher);
        return NextResponse.json({ success: true, changes });
      }

      case 'get_symptoms': {
        const symptoms = getAllSymptoms();
        return NextResponse.json({ symptoms });
      }

      case 'complete_session': {
        const { sessionId } = data;
        if (!sessionId) {
          return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
        }
        
        const changes = markSessionCompleted(sessionId);
        currentSessionId = null; // Clear current session
        
        // Cleanup old sessions (older than 24 hours) - non-critical operation
        try {
          cleanupOldActiveSessions(24);
        } catch (cleanupError) {
          console.warn('[API] Session cleanup failed but session completion succeeded:', cleanupError);
        }
        
        return NextResponse.json({ success: true, changes });
      }

      case 'abandon_session': {
        const { sessionId } = data;
        if (sessionId) {
          markSessionAbandoned(sessionId);
        }
        currentSessionId = null; // Clear current session
        return NextResponse.json({ success: true });
      }

      case 'cleanup_sessions': {
        const { hoursOld = 24 } = data;
        const changes = cleanupOldActiveSessions(hoursOld);
        return NextResponse.json({ success: true, cleaned: changes });
      }

      case 'get_session_stats': {
        const stats = getSessionStats();
        return NextResponse.json({ stats });
      }

      case 'save_final_results': {
        const { sessionId, results } = data;
        if (!sessionId) {
          return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
        }
        
        console.log('[API] save_final_results called for session:', sessionId);
        
        try {
          // Update the session with complete results data
          const changes = updateGameResults(sessionId, results);
          
          // Mark session as completed
          markSessionCompleted(sessionId);
          
          console.log('[API] Successfully saved final results and marked session as completed:', sessionId);
          return NextResponse.json({ success: true, changes });
        } catch (error) {
          console.error('[API] Error saving final results:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return NextResponse.json({ error: 'Final save failed', details: errorMessage }, { status: 500 });
        }
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('[API Error]:', error);
    return NextResponse.json({ error: 'Database operation failed' }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Return only completed sessions by default
    const results = getCompletedResults();
    return NextResponse.json({ results });
  } catch (error) {
    console.error('[API Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
  }
}