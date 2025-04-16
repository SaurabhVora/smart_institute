import 'dotenv/config';
import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "../shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'faculty', 'student', 'company')),
    name TEXT NOT NULL,
    email TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    phone TEXT,
    university TEXT,
    department TEXT,
    year TEXT,
    bio TEXT,
    company_name TEXT,
    industry TEXT,
    position TEXT,
    expertise TEXT,
    profile_completed BOOLEAN DEFAULT FALSE
  );
`;

const createPasswordResetTokensTable = `
  CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP
  );
`;

const createEmailVerificationTokensTable = `
  CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP
  );
`;

const createDocumentsTable = `
  CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    type TEXT NOT NULL CHECK (type IN ('offer_letter', 'noc', 'monthly_report', 'attendance')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    file_path TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    company_name TEXT,
    internship_domain TEXT
  );
`;

const createFacultyAllocationsTable = `
  CREATE TABLE IF NOT EXISTS faculty_allocations (
    id SERIAL PRIMARY KEY,
    faculty_id INTEGER NOT NULL REFERENCES users(id),
    student_id INTEGER NOT NULL REFERENCES users(id),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed'))
  );
`;

const createFacultyDocumentsTable = `
  CREATE TABLE IF NOT EXISTS faculty_documents (
    id SERIAL PRIMARY KEY,
    faculty_id INTEGER NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT,
    file_path TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

const createDocumentFeedbackTable = `
  CREATE TABLE IF NOT EXISTS document_feedback (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL REFERENCES documents(id),
    faculty_id INTEGER NOT NULL REFERENCES users(id),
    feedback TEXT NOT NULL,
    rating INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
  );
`;

const createResourcesTable = `
  CREATE TABLE IF NOT EXISTS resources (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    url TEXT,
    type TEXT NOT NULL CHECK (type IN ('guideline', 'link')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER NOT NULL REFERENCES users(id)
  );
`;

// Create tables in the correct order
async function initializeTables() {
  try {
    await pool.query(createUsersTable);
    await pool.query(createPasswordResetTokensTable);
    await pool.query(createEmailVerificationTokensTable);
    await pool.query(createDocumentsTable);
    await pool.query(createFacultyAllocationsTable);
    await pool.query(createFacultyDocumentsTable);
    await pool.query(createDocumentFeedbackTable);
    await pool.query(createResourcesTable);
    console.log('All tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

// Initialize tables
initializeTables();

export const db = drizzle(pool, { schema });