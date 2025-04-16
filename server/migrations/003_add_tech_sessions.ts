import { pool } from '../db';

export async function up() {
  // Create tech_sessions table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tech_sessions (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      date TIMESTAMP NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      location TEXT NOT NULL,
      virtual_meeting_link TEXT,
      capacity INTEGER DEFAULT 30,
      category TEXT DEFAULT 'other',
      faculty_id INTEGER NOT NULL REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'upcoming'
    )
  `);

  // Create session_registrations table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS session_registrations (
      id SERIAL PRIMARY KEY,
      session_id INTEGER NOT NULL REFERENCES tech_sessions(id) ON DELETE CASCADE,
      student_id INTEGER NOT NULL REFERENCES users(id),
      registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      attended BOOLEAN DEFAULT FALSE,
      feedback TEXT,
      rating INTEGER
    )
  `);
}

export async function down() {
  // Drop session_registrations table first (because it references tech_sessions)
  await pool.query(`DROP TABLE IF EXISTS session_registrations`);
  
  // Drop tech_sessions table
  await pool.query(`DROP TABLE IF EXISTS tech_sessions`);
} 