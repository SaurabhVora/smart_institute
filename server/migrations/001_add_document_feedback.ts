import { PoolClient } from 'pg';

export async function up(client: PoolClient) {
  // Create document_feedback table
  await client.query(`
    CREATE TABLE IF NOT EXISTS document_feedback (
      id SERIAL PRIMARY KEY,
      document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      faculty_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      feedback TEXT NOT NULL,
      rating INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  console.log('Created document_feedback table');
}

export async function down(client: PoolClient) {
  // Drop document_feedback table
  await client.query(`DROP TABLE IF EXISTS document_feedback`);
  
  console.log('Dropped document_feedback table');
} 