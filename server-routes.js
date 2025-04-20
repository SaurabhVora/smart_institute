import { createServer } from 'http';
import { pool } from './dist/db.js';

// Simple test route
const testRoute = (req, res) => {
  res.json({ message: "API is working!" });
};

// Example user route to test database connection
const getUsersRoute = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email FROM users LIMIT 10');
    res.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error', details: error.message });
  }
};

// Register all API routes
export function registerRoutes(app) {
  // Create HTTP server from Express app
  const server = createServer(app);
  
  // Register API routes
  app.get('/api/test', testRoute);
  app.get('/api/users', getUsersRoute);
  
  // Add more routes here as needed
  
  return server;
} 