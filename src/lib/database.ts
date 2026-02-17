import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';

// Database connection function with proper initialization
let databaseEnabled = true;
let jsonFallbackMode = false;
const jsonDbPath = path.join(process.cwd(), 'data', 'results.json');
let currentSessionCounter = 1;

// JSON Database fallback functions
function initJsonDatabase() {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    if (!fs.existsSync(jsonDbPath)) {
      fs.writeFileSync(jsonDbPath, JSON.stringify({ sessions: [], symptoms: getDefaultSymptoms(), nextId: 1 }, null, 2));
    }
    
    const data = JSON.parse(fs.readFileSync(jsonDbPath, 'utf8'));
    currentSessionCounter = data.nextId || 1;
    
    console.log('[JSON Database] Initialized with', data.sessions?.length || 0, 'sessions');
    return data;
  } catch (error) {
    console.error('[JSON Database] Init error:', error);
    return { sessions: [], symptoms: getDefaultSymptoms(), nextId: 1 };
  }
}

function saveJsonDatabase(data: any) {
  try {
    fs.writeFileSync(jsonDbPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('[JSON Database] Save error:', error);
  }
}

function getDefaultSymptoms() {
  return [
    { id: 1, symptom_key: 'anxietyPanic', deutsch: 'Angst, Panik', englisch: 'Anxiety, panic' },
    { id: 2, symptom_key: 'depression', deutsch: 'Depression, Niedergeschlagenheit, Traurigkeit', englisch: 'Depression, dejection, sadness' },
    { id: 3, symptom_key: 'flashback', deutsch: 'Flashback', englisch: 'Flashback' },
    { id: 4, symptom_key: 'rumination', deutsch: 'Grübeln, Gedankenkreisen', englisch: 'Rumination, circular thoughts' },
    { id: 5, symptom_key: 'pain', deutsch: 'Schmerzen', englisch: 'Pain' },
    { id: 6, symptom_key: 'anger', deutsch: 'Wut, Aggressivität', englisch: 'Anger, aggression' },
    { id: 7, symptom_key: 'obsessiveThoughts', deutsch: 'Zwangsgedanken', englisch: 'Obsessive thoughts' },
    { id: 8, symptom_key: 'alcoholCraving', deutsch: 'Alkoholverlangen', englisch: 'Alcohol craving' },
    { id: 9, symptom_key: 'drugCraving', deutsch: 'Drogenverlangen', englisch: 'Drug craving' },
    { id: 10, symptom_key: 'eating', deutsch: 'Essen', englisch: 'Eating' },
    { id: 11, symptom_key: 'nicotineCraving', deutsch: 'Nikotinverlangen', englisch: 'Nicotine craving' },
    { id: 12, symptom_key: 'otherSymptom', deutsch: 'Anderes Symptom', englisch: 'Other symptom' }
  ];
}

function initDatabase() {
  try {
    if (!databaseEnabled) {
      throw new Error('Database disabled due to previous errors');
    }
    
    const Database = require('better-sqlite3');
    const dataDir = path.join(process.cwd(), 'data');
    
    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log('[Database] Created data directory:', dataDir);
    }
    
    const dbPath = path.join(dataDir, 'results.db');
    const backupPath = path.join(dataDir, 'results_backup.db');
    
    // Check if database exists and test it for UTF16 issues
    let needsRecreation = false;
    if (fs.existsSync(dbPath)) {
      try {
        const testDb = new Database(dbPath);
        // Simple test query to check for collation issues
        testDb.prepare("SELECT COUNT(*) FROM sqlite_master").get();
        testDb.close();
        console.log('[Database] Existing database passed collation test');
      } catch (error: any) {
        console.warn('[Database] Existing database has collation issues, will recreate:', error?.message || error);
        needsRecreation = true;
        
        // Backup the corrupted database
        if (fs.existsSync(dbPath)) {
          try {
            fs.copyFileSync(dbPath, backupPath);
            console.log('[Database] Backed up problematic database to:', backupPath);
          } catch (backupError) {
            console.warn('[Database] Could not backup database:', backupError);
          }
        }
      }
    }
    
    // Remove and recreate database if needed
    if (needsRecreation && fs.existsSync(dbPath)) {
      try {
        fs.unlinkSync(dbPath);
        console.log('[Database] Removed problematic database file');
      } catch (error) {
        console.error('[Database] Could not remove database file:', error);
        throw error;
      }
    }
    
    console.log('[Database] Initializing database at:', dbPath);
    
    const db = new Database(dbPath);
    
    // Set proper encoding and collation to avoid UTF16 issues
    db.pragma('encoding = "UTF-8"');
    db.pragma('case_sensitive_like = OFF');
    
    // Database schema
    const createTableSQL = `
    CREATE TABLE IF NOT EXISTS user_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      client_session_id TEXT, -- Unique identifier for each browser session
      
      -- Mood and symptom data (filled later)
      mood_vorher REAL,
      mood_nachher REAL,
      hauptsymptom INTEGER, -- FK to hauptsymptome table
      hauptsymptom_vorher REAL, -- Intensity 0-10
      hauptsymptom_nachher REAL, -- Intensity 0-10
      
      -- Overall task statistics
      total_attempts INTEGER DEFAULT 0,
      total_correct INTEGER DEFAULT 0,
      total_accuracy REAL DEFAULT 0.0,
      total_points INTEGER DEFAULT 0,
      
      -- Individual task results
      math_attempts INTEGER DEFAULT 0,
      math_correct INTEGER DEFAULT 0,
      math_accuracy REAL DEFAULT 0.0,
      
      pie_attempts INTEGER DEFAULT 0,
      pie_correct INTEGER DEFAULT 0,
      pie_accuracy REAL DEFAULT 0.0,
      
      chess_attempts INTEGER DEFAULT 0,
      chess_correct INTEGER DEFAULT 0,
      chess_accuracy REAL DEFAULT 0.0,
      
      faden_attempts INTEGER DEFAULT 0,
      faden_correct INTEGER DEFAULT 0,
      faden_accuracy REAL DEFAULT 0.0,
      
      hand_attempts INTEGER DEFAULT 0,
      hand_correct INTEGER DEFAULT 0,
      hand_accuracy REAL DEFAULT 0.0,
      
      face1_attempts INTEGER DEFAULT 0,
      face1_correct INTEGER DEFAULT 0,
      face1_accuracy REAL DEFAULT 0.0,
      
      face2_attempts INTEGER DEFAULT 0,
      face2_correct INTEGER DEFAULT 0,
      face2_accuracy REAL DEFAULT 0.0,
      
      -- Phase points
      phase1_points INTEGER DEFAULT 0,
      phase2_points INTEGER DEFAULT 0,
      phase3_points INTEGER DEFAULT 0,
      
      -- Session management
      session_status TEXT DEFAULT 'active'
    )
  `;
  
  const createHauptsymptomeTableSQL = `
    CREATE TABLE IF NOT EXISTS hauptsymptome (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      symptom_key TEXT UNIQUE NOT NULL,
      deutsch TEXT NOT NULL,
      englisch TEXT NOT NULL,
      spanisch TEXT NOT NULL,
      franzoesisch TEXT NOT NULL,
      italienisch TEXT NOT NULL,
      niederlaendisch TEXT NOT NULL,
      portugiesisch TEXT NOT NULL
    )
  `;
  
  // Initialize database
  try {
    db.exec(createTableSQL);
    db.exec(createHauptsymptomeTableSQL);
    console.log('[Database] Tables created successfully');
    
    // Check and fix column types that might cause collation issues
    try {
      const tableInfo = db.prepare("PRAGMA table_info(user_results)").all() as Array<{cid: number, name: string, type: string, notnull: number, dflt_value: any, pk: number}>;
      
      // Check if phase_points columns have wrong type (TEXT instead of INTEGER)
      const problemColumns = tableInfo.filter(col => 
        (col.name === 'phase1_points' || col.name === 'phase2_points' || col.name === 'phase3_points') && 
        col.type.toUpperCase() !== 'INTEGER'
      );
      
      // Check if mood columns have wrong type (INTEGER instead of REAL) 
      const moodColumns = tableInfo.filter(col =>
        (col.name === 'mood_vorher' || col.name === 'mood_nachher') && 
        col.type.toUpperCase() !== 'REAL'
      );
      
      // Check for problematic collation sequences by testing session_status column
      let hasCollationProblems = false;
      try {
        db.prepare("SELECT COUNT(*) FROM user_results WHERE session_status = 'test'").get();
      } catch (collationError: any) {
        if (collationError?.message?.includes('UTF16') || collationError?.message?.includes('collation')) {
          hasCollationProblems = true;
          console.log('[Database] Found UTF16 collation problems in session_status column');
        }
      }
      
      if (problemColumns.length > 0 || moodColumns.length > 0 || hasCollationProblems) {
        if (problemColumns.length > 0) {
          console.log('[Database] Found phase_points columns with wrong type:', problemColumns.map(c => `${c.name}:${c.type}`));
        }
        if (moodColumns.length > 0) {
          console.log('[Database] Found mood columns with wrong type:', moodColumns.map(c => `${c.name}:${c.type}`));
        }
        if (hasCollationProblems) {
          console.log('[Database] Found problematic collation sequences, will recreate table without collation');
        }
        
        // Create new table with correct types and NO collation sequences
        const migrationSQL = `
          -- Create temporary table with correct types and NO collation
          CREATE TABLE user_results_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            client_session_id TEXT,
            mood_vorher REAL,
            mood_nachher REAL,
            hauptsymptom INTEGER,
            hauptsymptom_vorher INTEGER,
            hauptsymptom_nachher REAL,
            total_attempts INTEGER DEFAULT 0,
            total_correct INTEGER DEFAULT 0,
            total_accuracy REAL DEFAULT 0.0,
            total_points INTEGER DEFAULT 0,
            math_attempts INTEGER DEFAULT 0,
            math_correct INTEGER DEFAULT 0,
            math_accuracy REAL DEFAULT 0.0,
            pie_attempts INTEGER DEFAULT 0,
            pie_correct INTEGER DEFAULT 0,
            pie_accuracy REAL DEFAULT 0.0,
            chess_attempts INTEGER DEFAULT 0,
            chess_correct INTEGER DEFAULT 0,
            chess_accuracy REAL DEFAULT 0.0,
            faden_attempts INTEGER DEFAULT 0,
            faden_correct INTEGER DEFAULT 0,
            faden_accuracy REAL DEFAULT 0.0,
            hand_attempts INTEGER DEFAULT 0,
            hand_correct INTEGER DEFAULT 0,
            hand_accuracy REAL DEFAULT 0.0,
            face1_attempts INTEGER DEFAULT 0,
            face1_correct INTEGER DEFAULT 0,
            face1_accuracy REAL DEFAULT 0.0,
            face2_attempts INTEGER DEFAULT 0,
            face2_correct INTEGER DEFAULT 0,
            face2_accuracy REAL DEFAULT 0.0,
            phase1_points INTEGER DEFAULT 0,
            phase2_points INTEGER DEFAULT 0,
            phase3_points INTEGER DEFAULT 0,
            session_status TEXT DEFAULT 'active'
          );
          
          -- Copy data from old table
          INSERT INTO user_results_new SELECT 
            id, timestamp, client_session_id,
            CAST(mood_vorher AS REAL) as mood_vorher, 
            CAST(mood_nachher AS REAL) as mood_nachher, 
            hauptsymptom, hauptsymptom_vorher, hauptsymptom_nachher,
            total_attempts, total_correct, total_accuracy, total_points,
            math_attempts, math_correct, math_accuracy,
            pie_attempts, pie_correct, pie_accuracy,
            chess_attempts, chess_correct, chess_accuracy,
            faden_attempts, faden_correct, faden_accuracy,
            hand_attempts, hand_correct, hand_accuracy,
            face1_attempts, face1_correct, face1_accuracy,
            face2_attempts, face2_correct, face2_accuracy,
            CAST(COALESCE(phase1_points, '0') AS INTEGER) as phase1_points,
            CAST(COALESCE(phase2_points, '0') AS INTEGER) as phase2_points,
            CAST(COALESCE(phase3_points, '0') AS INTEGER) as phase3_points,
            session_status
          FROM user_results;
          
          -- Drop old table and rename new one
          DROP TABLE user_results;
          ALTER TABLE user_results_new RENAME TO user_results;
        `;
        
        db.exec(migrationSQL);
        console.log('[Database] Successfully migrated table: removed UTF16 collations and fixed column types');
      } else {
        console.log('[Database] All columns have correct types and no collation problems');
      }
    } catch (checkError) {
      console.warn('[Database] Could not check/fix column types:', checkError);
    }
    
  } catch (error) {
    console.error('[Database] Error creating tables:', error);
    throw error;
  }
  
  // Add client_session_id column to existing databases if it doesn't exist
  try {
    db.exec(`ALTER TABLE user_results ADD COLUMN client_session_id TEXT`);
    console.log('[Database] Added client_session_id column for multi-user support');
  } catch (error) {
    // Column already exists, ignore error
    console.log('[Database] client_session_id column already exists');
  }
  
  // Add hauptsymptom column to existing databases if it doesn't exist
  try {
    db.exec(`ALTER TABLE user_results ADD COLUMN hauptsymptom INTEGER`);
    console.log('[Database] Added hauptsymptom column to existing database');
  } catch (error) {
    // Column already exists, ignore error
    console.log('[Database] hauptsymptom column already exists');
  }
  
  // Add session_status column to existing databases if it doesn't exist
  try {
    db.exec(`ALTER TABLE user_results ADD COLUMN session_status TEXT DEFAULT 'active'`);
    console.log('[Database] Added session_status column to existing database');
  } catch (error) {
    // Column already exists, ignore error
    console.log('[Database] session_status column already exists');
  }
  
  // Insert symptom translations if table is empty
  const checkSymptoms = db.prepare('SELECT COUNT(*) as count FROM hauptsymptome').get() as { count: number };
  if (checkSymptoms.count === 0) {
    const insertSymptomSQL = `
      INSERT INTO hauptsymptome (symptom_key, deutsch, englisch, spanisch, franzoesisch, italienisch, niederlaendisch, portugiesisch)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const symptomData = [
      ['anxietyPanic', 'Angst, Panik', 'Anxiety, panic', 'Ansiedad, pánico', 'Anxiété, panique', 'Ansia, panico', 'Angst, paniek', 'Ansiedade, pânico'],
      ['depression', 'Depression, Niedergeschlagenheit, Traurigkeit', 'Depression, dejection, sadness', 'Depresión, abatimiento, tristeza', 'Dépression, abattement, tristesse', 'Depressione, abbattimento, tristezza', 'Depressie, neerslachtigheid, verdriet', 'Depressão, desânimo, tristeza'],
      ['flashback', 'Flashback', 'Flashback', 'Flashback', 'Flashback', 'Flashback', 'Flashback', 'Flashback'],
      ['rumination', 'Grübeln, Gedankenkreisen', 'Rumination, circular thoughts', 'Rumiación, pensamientos circulares', 'Rumination, pensées circulaires', 'Rimuginazione, pensieri circolari', 'Piekeren, circulaire gedachten', 'Ruminação, pensamentos circulares'],
      ['pain', 'Schmerzen', 'Pain', 'Dolor', 'Douleur', 'Dolore', 'Pijn', 'Dor'],
      ['anger', 'Wut, Aggressivität', 'Anger, aggression', 'Ira, agresividad', 'Colère, agressivité', 'Rabbia, aggressività', 'Woede, agressiviteit', 'Raiva, agressividade'],
      ['obsessiveThoughts', 'Zwangsgedanken', 'Obsessive thoughts', 'Pensamientos obsesivos', 'Pensées obsessionnelles', 'Pensieri ossessivi', 'Obsessieve gedachten', 'Pensamentos obsessivos'],
      ['alcoholCraving', 'Alkoholverlangen', 'Alcohol craving', 'Deseo de alcohol', 'Envie d\'alcool', 'Desiderio di alcol', 'Alcoholverlangen', 'Desejo de álcool'],
      ['drugCraving', 'Drogenverlangen', 'Drug craving', 'Deseo de drogas', 'Envie de drogue', 'Desiderio di droga', 'Drugsverlangen', 'Desejo de drogas'],
      ['eating', 'Essen', 'Eating', 'Comer', 'Manger', 'Mangiare', 'Eten', 'Comer'],
      ['nicotineCraving', 'Nikotinverlangen', 'Nicotine craving', 'Deseo de nicotina', 'Envie de nicotine', 'Desiderio di nicotina', 'Nicotineverlangen', 'Desejo de nicotina'],
      ['otherSymptom', 'Anderes Symptom', 'Other symptom', 'Otro síntoma', 'Autre symptôme', 'Altro sintomo', 'Ander symptoom', 'Outro sintoma']
    ];
    
    const stmt = db.prepare(insertSymptomSQL);
    for (const symptom of symptomData) {
      stmt.run(...symptom);
    }
    
    console.log('[Database] Hauptsymptome table initialized with', symptomData.length, 'symptoms');
  }
  
  // Add mood intensity columns as INTEGER if they exist as TEXT
  try {
    db.exec(`ALTER TABLE user_results ADD COLUMN hauptsymptom_vorher_int INTEGER`);
    db.exec(`UPDATE user_results SET hauptsymptom_vorher_int = CAST(hauptsymptom_vorher AS INTEGER) WHERE hauptsymptom_vorher IS NOT NULL`);
    db.exec(`ALTER TABLE user_results DROP COLUMN hauptsymptom_vorher`);
    db.exec(`ALTER TABLE user_results RENAME COLUMN hauptsymptom_vorher_int TO hauptsymptom_vorher`);
    console.log('[Database] Converted hauptsymptom_vorher to INTEGER');
  } catch (error) {
    console.log('[Database] hauptsymptom_vorher already INTEGER or conversion not needed');
  }
  
  console.log('[Database] Database initialization completed successfully');
  return db;
  
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Database] Module load error - switching to JSON fallback:', errorMessage);
    databaseEnabled = false;
    jsonFallbackMode = true;
    // Initialize JSON database as fallback
    initJsonDatabase();
    // Return a JSON database object
    return {
      prepare: () => ({ 
        run: (...args: any[]) => ({ lastInsertRowid: currentSessionCounter++, changes: 1 }),
        get: (key: string) => null,
        all: () => [] 
      }),
      exec: () => {},
      close: () => {}
    };
  }
}

export interface GameResults {
  // Mood and symptom data
  mood_vorher?: number;
  mood_nachher?: number;
  hauptsymptom?: string; // Symptom key
  hauptsymptom_vorher?: number;
  hauptsymptom_nachher?: number;
  
  // Overall stats
  total_attempts: number;
  total_correct: number;
  total_accuracy: number;
  total_points: number;
  
  // Individual task stats
  math_attempts?: number;
  math_correct?: number;
  math_accuracy?: number;
  
  pie_attempts?: number;
  pie_correct?: number;
  pie_accuracy?: number;
  
  chess_attempts?: number;
  chess_correct?: number;
  chess_accuracy?: number;
  
  faden_attempts?: number;
  faden_correct?: number;
  faden_accuracy?: number;
  
  hand_attempts?: number;
  hand_correct?: number;
  hand_accuracy?: number;
  
  face1_attempts?: number;
  face1_correct?: number;
  face1_accuracy?: number;
  
  face2_attempts?: number;
  face2_correct?: number;
  face2_accuracy?: number;
  
  // Phase points
  phase1_points?: number;
  phase2_points?: number;
  phase3_points?: number;
}

export function saveGameResults(results: GameResults): number {
  let db: any = null;
  try {
    console.log('[Database] saveGameResults called with:', results);
    db = initDatabase();
    
    // Get symptom ID if symptom key is provided
    let symptomId = null;
    if (results.hauptsymptom) {
      symptomId = getSymptomIdByKey(results.hauptsymptom);
    }
    
    const insertSQL = `
      INSERT INTO user_results (
        mood_vorher, mood_nachher, hauptsymptom, hauptsymptom_vorher, hauptsymptom_nachher,
        total_attempts, total_correct, total_accuracy, total_points,
        math_attempts, math_correct, math_accuracy,
        pie_attempts, pie_correct, pie_accuracy,
        chess_attempts, chess_correct, chess_accuracy,
        faden_attempts, faden_correct, faden_accuracy,
        hand_attempts, hand_correct, hand_accuracy,
        face1_attempts, face1_correct, face1_accuracy,
        face2_attempts, face2_correct, face2_accuracy,
        phase1_points, phase2_points, phase3_points
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?
      )
    `;
    
    const stmt = db.prepare(insertSQL);
    const result = stmt.run(
      results.mood_vorher || null, results.mood_nachher || null, symptomId, results.hauptsymptom_vorher || null, results.hauptsymptom_nachher || null,
      results.total_attempts, results.total_correct, results.total_accuracy, results.total_points,
      results.math_attempts || 0, results.math_correct || 0, results.math_accuracy || 0.0,
      results.pie_attempts || 0, results.pie_correct || 0, results.pie_accuracy || 0.0,
      results.chess_attempts || 0, results.chess_correct || 0, results.chess_accuracy || 0.0,
      results.faden_attempts || 0, results.faden_correct || 0, results.faden_accuracy || 0.0,
      results.hand_attempts || 0, results.hand_correct || 0, results.hand_accuracy || 0.0,
      results.face1_attempts || 0, results.face1_correct || 0, results.face1_accuracy || 0.0,
      results.face2_attempts || 0, results.face2_correct || 0, results.face2_accuracy || 0.0,
      results.phase1_points || 0, results.phase2_points || 0, results.phase3_points || 0
    );
    
    console.log('[Database] Game results saved with ID:', result.lastInsertRowid);
    const insertId = result.lastInsertRowid as number;
    db.close();
    return insertId;
  } catch (error) {
    console.error('[Database] Error in saveGameResults:', error);
    if (db) {
      db.close();
    }
    throw error;
  }
}

// New function to create a session with mood data directly
export function createMoodSession(moodVorher: number, hauptsymptomId?: number, symptomVorher?: number): number {
  if (!databaseEnabled && !jsonFallbackMode) {
    console.log('[Database] Database disabled - returning mock session ID');
    return Math.floor(Math.random() * 1000) + 1;
  }

  try {
    console.log('[Database] createMoodSession called with mood:', moodVorher, 'symptom ID:', hauptsymptomId, 'intensity:', symptomVorher);
    
    if (jsonFallbackMode) {
      const data = initJsonDatabase();
      const sessionId = data.nextId++;
      const newSession = {
        id: sessionId,
        timestamp: new Date().toISOString(),
        total_attempts: 0,
        total_correct: 0,
        total_accuracy: 0.0,
        total_points: 0,
        mood_vorher: moodVorher,
        hauptsymptom: hauptsymptomId || null,
        hauptsymptom_vorher: symptomVorher || null,
        mood_nachher: null,
        hauptsymptom_nachher: null
      };
      
      data.sessions.push(newSession);
      data.nextId = sessionId + 1;
      saveJsonDatabase(data);
      
      console.log('[JSON Database] Mood session created with ID:', sessionId);
      return sessionId;
    }

    // SQLite mode
    let db: any = null;
    db = initDatabase();
    
    const insertSQL = `
      INSERT INTO user_results (
        total_attempts, total_correct, total_accuracy, total_points,
        mood_vorher, hauptsymptom, hauptsymptom_vorher
      ) VALUES (0, 0, 0.0, 0, ?, ?, ?)
    `;
    
    const stmt = db.prepare(insertSQL);
    const result = stmt.run(moodVorher, hauptsymptomId || null, symptomVorher || null);
    
    console.log('[Database] Mood session created with ID:', result.lastInsertRowid);
    const insertId = result.lastInsertRowid as number;
    db.close();
    return insertId;
  } catch (error) {
    console.error('[Database] Error in createMoodSession:', error);
    throw error;
  }
}

export function getAllResults() {
  const db = initDatabase();
  const selectSQL = 'SELECT * FROM user_results ORDER BY timestamp DESC';
  const results = db.prepare(selectSQL).all();
  db.close();
  return results;
}

export function getSymptomIdByKey(symptomKey: string): number | null {
  if (!databaseEnabled && !jsonFallbackMode) {
    return 1; // Return mock ID
  }

  if (jsonFallbackMode) {
    const data = initJsonDatabase();
    const symptom = data.symptoms.find((s: any) => s.symptom_key === symptomKey);
    return symptom ? symptom.id : null;
  }

  const db = initDatabase();
  const selectSQL = 'SELECT id FROM hauptsymptome WHERE symptom_key = ?';
  const result = db.prepare(selectSQL).get(symptomKey) as { id: number } | undefined;
  db.close();
  return result ? result.id : null;
}

export function getSymptomById(id: number): any {
  const db = initDatabase();
  const selectSQL = 'SELECT * FROM hauptsymptome WHERE id = ?';
  const result = db.prepare(selectSQL).get(id);
  db.close();
  return result;
}

export function getAllSymptoms() {
  const db = initDatabase();
  const selectSQL = 'SELECT * FROM hauptsymptome ORDER BY id';
  const results = db.prepare(selectSQL).all();
  db.close();
  return results;
}

export function updateMoodAndSymptoms(id: number, moodVorher?: number, moodNachher?: number, hauptsymptomId?: number, symptomVorher?: number, symptomNachher?: number) {
  let db: any = null;
  try {
    console.log('[Database] updateMoodAndSymptoms called with ID:', id, 'Mood:', moodVorher, 'Symptom ID:', hauptsymptomId, 'Intensity:', symptomVorher);
    db = initDatabase();
    
    // Build dynamic SQL based on provided parameters
    const updates: string[] = [];
    const values: any[] = [];
    
    if (moodVorher !== undefined) {
      updates.push('mood_vorher = ?');
      values.push(moodVorher);
    }
    if (moodNachher !== undefined) {
      updates.push('mood_nachher = ?');
      values.push(moodNachher);
    }
    if (hauptsymptomId !== undefined) {
      updates.push('hauptsymptom = ?');
      values.push(hauptsymptomId);
    }
    if (symptomVorher !== undefined) {
      updates.push('hauptsymptom_vorher = ?');
      values.push(Number(symptomVorher));
    }
    if (symptomNachher !== undefined) {
      updates.push('hauptsymptom_nachher = ?');
      values.push(Number(symptomNachher));
    }
    
    if (updates.length === 0) {
      console.log('[Database] No updates to perform for ID:', id);
      db.close();
      return 0;
    }
    
    const updateSQL = `UPDATE user_results SET ${updates.join(', ')} WHERE id = ?`;
    values.push(id);
    
    console.log('[Database] Updating ID:', id, 'SQL:', updateSQL, 'Values:', values);
    
    const stmt = db.prepare(updateSQL);
    const result = stmt.run(...values);
    
    console.log('[Database] Mood and symptoms updated for ID:', id, 'Changes:', result.changes);
    db.close();
    return result.changes;
  } catch (error) {
    console.error('[Database] Error in updateMoodAndSymptoms:', error);
    if (db) {
      db.close();
    }
    throw error;
  }
}

export function markSessionCompleted(id: number) {
  const db = initDatabase();
  const updateSQL = `UPDATE user_results SET session_status = 'completed' WHERE id = ?`;
  const stmt = db.prepare(updateSQL);
  const result = stmt.run(id);
  
  console.log('[Database] Session marked as completed for ID:', id);
  db.close();
  return result.changes;
}

export function markSessionAbandoned(id: number) {
  const db = initDatabase();
  const updateSQL = `UPDATE user_results SET session_status = 'abandoned' WHERE id = ?`;
  const stmt = db.prepare(updateSQL);
  const result = stmt.run(id);
  
  console.log('[Database] Session marked as abandoned for ID:', id);
  db.close();
  return result.changes;
}

export function cleanupOldActiveSessions(hoursOld: number = 24, clientSessionId?: string) {
  // Improved cleanup with session isolation for multi-user support
  try {
    const db = initDatabase();
    
    // Count active sessions - globally or per client session
    let countSQL = "SELECT COUNT(*) as count FROM user_results WHERE session_status = 'active'";
    let countParams: any[] = [];
    
    if (clientSessionId) {
      countSQL += " AND client_session_id = ?";
      countParams = [clientSessionId];
    }
    
    const countResult = db.prepare(countSQL).get(...countParams) as {count: number};
    
    if (clientSessionId) {
      console.log('[Database] Active sessions for client', clientSessionId + ':', countResult.count);
    } else {
      console.log('[Database] Total active sessions across all users:', countResult.count);
    }
    
    // Conservative cleanup: only if too many sessions
    const threshold = clientSessionId ? 10 : 50; // Lower threshold per client
    
    if (countResult.count > threshold) {
      let oldSessionsSQL = "SELECT id FROM user_results WHERE session_status = 'active'";
      let selectParams: any[] = [];
      
      if (clientSessionId) {
        oldSessionsSQL += " AND client_session_id = ?";
        selectParams = [clientSessionId];
      }
      
      oldSessionsSQL += " ORDER BY id ASC LIMIT 5"; // Conservative limit
      
      const oldSessions = db.prepare(oldSessionsSQL).all(...selectParams) as Array<{id: number}>;
      
      let cleaned = 0;
      oldSessions.forEach(session => {
        try {
          const updateSQL = "UPDATE user_results SET session_status = 'abandoned' WHERE id = ?";
          db.prepare(updateSQL).run(session.id);
          cleaned++;
        } catch (error) {
          console.warn('[Database] Failed to cleanup session ID:', session.id);
        }
      });
      
      const context = clientSessionId ? `for client ${clientSessionId}` : 'globally';
      console.log('[Database] Conservative cleanup:', cleaned, 'oldest sessions marked as abandoned', context);
      db.close();
      return cleaned;
    } else {
      const context = clientSessionId ? 'for this client' : 'globally';
      console.log('[Database] Active session count acceptable', context + ', no cleanup needed');
      db.close();
      return 0;
    }
    
  } catch (error) {
    console.warn('[Database] Session monitoring failed, but this is non-critical:', error);
    return 0;
  }
}

export function getSessionStats() {
  const db = initDatabase();
  const statsSQL = `
    SELECT 
      session_status,
      COUNT(*) as count,
      AVG(total_points) as avg_points,
      AVG(mood_vorher) as avg_mood_before
    FROM user_results 
    GROUP BY session_status
  `;
  
  const results = db.prepare(statsSQL).all();
  db.close();
  return results;
}

export function getCompletedResults() {
  const db = initDatabase();
  const selectSQL = `SELECT * FROM user_results WHERE session_status = 'completed' ORDER BY timestamp DESC`;
  const results = db.prepare(selectSQL).all();
  db.close();
  return results;
}

export function updateGameResults(sessionId: number, results: GameResults): number {
  if (!databaseEnabled && !jsonFallbackMode) {
    console.log('[Database] Database disabled - returning mock changes');
    return 1;
  }

  try {
    if (jsonFallbackMode) {
      const data = initJsonDatabase();
      const sessionIndex = data.sessions.findIndex((session: any) => session.id === sessionId);
      
      if (sessionIndex === -1) {
        console.error('[JSON Database] Session not found:', sessionId);
        return 0;
      }
      
      // Get symptom ID if symptom key is provided
      let symptomId = null;
      if (results.hauptsymptom) {
        const symptom = data.symptoms.find((s: any) => s.symptom_key === results.hauptsymptom);
        symptomId = symptom ? symptom.id : null;
      }
      
      // Update the session object
      const session = data.sessions[sessionIndex];
      Object.assign(session, {
        mood_nachher: results.mood_nachher || null,
        hauptsymptom_nachher: results.hauptsymptom_nachher || null,
        total_attempts: results.total_attempts,
        total_correct: results.total_correct,
        total_accuracy: results.total_accuracy,
        total_points: results.total_points,
        math_attempts: results.math_attempts || 0,
        math_correct: results.math_correct || 0,
        math_accuracy: results.math_accuracy || 0.0,
        pie_attempts: results.pie_attempts || 0,
        pie_correct: results.pie_correct || 0,
        pie_accuracy: results.pie_accuracy || 0.0,
        chess_attempts: results.chess_attempts || 0,
        chess_correct: results.chess_correct || 0,
        chess_accuracy: results.chess_accuracy || 0.0,
        faden_attempts: results.faden_attempts || 0,
        faden_correct: results.faden_correct || 0,
        faden_accuracy: results.faden_accuracy || 0.0,
        hand_attempts: results.hand_attempts || 0,
        hand_correct: results.hand_correct || 0,
        hand_accuracy: results.hand_accuracy || 0.0,
        face1_attempts: results.face1_attempts || 0,
        face1_correct: results.face1_correct || 0,
        face1_accuracy: results.face1_accuracy || 0.0,
        face2_attempts: results.face2_attempts || 0,
        face2_correct: results.face2_correct || 0,
        face2_accuracy: results.face2_accuracy || 0.0,
        phase1_points: results.phase1_points || 0,
        phase2_points: results.phase2_points || 0,
        phase3_points: results.phase3_points || 0
      });
      
      saveJsonDatabase(data);
      console.log('[JSON Database] Game results updated for session:', sessionId);
      return 1;
    }
  
    // SQLite mode
    const db = initDatabase();
  
    // Get symptom ID if symptom key is provided
    let symptomId = null;
    if (results.hauptsymptom) {
      symptomId = getSymptomIdByKey(results.hauptsymptom);
    }
  
    const updateSQL = `
      UPDATE user_results 
      SET mood_nachher = ?, hauptsymptom_nachher = ?,
          total_attempts = ?, total_correct = ?, total_accuracy = ?, total_points = ?,
          math_attempts = ?, math_correct = ?, math_accuracy = ?,
          pie_attempts = ?, pie_correct = ?, pie_accuracy = ?,
          chess_attempts = ?, chess_correct = ?, chess_accuracy = ?,
          faden_attempts = ?, faden_correct = ?, faden_accuracy = ?,
          hand_attempts = ?, hand_correct = ?, hand_accuracy = ?,
          face1_attempts = ?, face1_correct = ?, face1_accuracy = ?,
          face2_attempts = ?, face2_correct = ?, face2_accuracy = ?,
          phase1_points = ?, phase2_points = ?, phase3_points = ?
      WHERE id = ?
    `;
  
    const stmt = db.prepare(updateSQL);
    const result = stmt.run(
      results.mood_nachher || null, results.hauptsymptom_nachher || null,
      results.total_attempts, results.total_correct, results.total_accuracy, results.total_points,
      results.math_attempts || 0, results.math_correct || 0, results.math_accuracy || 0.0,
      results.pie_attempts || 0, results.pie_correct || 0, results.pie_accuracy || 0.0,
      results.chess_attempts || 0, results.chess_correct || 0, results.chess_accuracy || 0.0,
      results.faden_attempts || 0, results.faden_correct || 0, results.faden_accuracy || 0.0,
      results.hand_attempts || 0, results.hand_correct || 0, results.hand_accuracy || 0.0,
      results.face1_attempts || 0, results.face1_correct || 0, results.face1_accuracy || 0.0,
      results.face2_attempts || 0, results.face2_correct || 0, results.face2_accuracy || 0.0,
      results.phase1_points || 0, results.phase2_points || 0, results.phase3_points || 0,
      sessionId
    );
  
    console.log('[Database] Game results updated for session:', sessionId, 'Changes:', result.changes);
    db.close();
    return result.changes;
  } catch (error) {
    console.error('[Database] Error updating game results:', error);
    return 0;
  }
}