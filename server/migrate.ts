import { pool } from './db';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { pathToFileURL } from 'url';

// Get current file path in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Migration tracking table
async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// Get all migration files
async function getMigrationFiles() {
  const migrationsDir = path.join(__dirname, 'migrations');
  
  // Create migrations directory if it doesn't exist
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
  }
  
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.ts') || file.endsWith('.js'))
    .sort(); // Sort to ensure migrations run in order
  
  return files;
}

// Get already applied migrations
async function getAppliedMigrations() {
  const result = await pool.query('SELECT name FROM migrations');
  return result.rows.map(row => row.name);
}

// Run migrations
export async function runMigrations() {
  console.log('Starting migrations...');
  await ensureMigrationsTable();
  
  const migrationFiles = await getMigrationFiles();
  const appliedMigrations = await getAppliedMigrations();
  
  // Filter out already applied migrations
  const pendingMigrations = migrationFiles.filter(file => {
    return !appliedMigrations.includes(file);
  });
  
  if (pendingMigrations.length === 0) {
    console.log('No pending migrations to apply.');
    return;
  }
  
  console.log(`Found ${pendingMigrations.length} pending migrations.`);
  
  // Run each pending migration
  for (const migrationFile of pendingMigrations) {
    console.log(`Applying migration: ${migrationFile}`);
    
    const client = await pool.connect();
    
    try {
      // Import migration file (using dynamic import for ESM)
      const migrationPath = path.join(__dirname, 'migrations', migrationFile);
      // Convert the file path to a file:// URL for ESM imports (works on Windows too)
      const migrationUrl = pathToFileURL(migrationPath).href;
      const migration = await import(migrationUrl);
      
      // Begin transaction
      await client.query('BEGIN');
      
      // Run migration
      await migration.up(client);
      
      // Record migration
      await client.query('INSERT INTO migrations (name) VALUES ($1)', [migrationFile]);
      
      // Commit transaction
      await client.query('COMMIT');
      
      console.log(`Successfully applied migration: ${migrationFile}`);
    } catch (error) {
      // Rollback on error
      await client.query('ROLLBACK');
      console.error(`Error applying migration ${migrationFile}:`, error);
      throw error; // Re-throw to be caught by the outer try/catch
    } finally {
      client.release();
    }
  }
  
  console.log('All migrations applied successfully.');
}

// Run migrations when script is executed directly (ESM version)
if (import.meta.url.startsWith('file:') && process.argv[1] && import.meta.url.endsWith(process.argv[1])) {
  runMigrations()
    .then(() => {
      console.log('Migration process completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Migration error:', error);
      process.exit(1);
    });
} 