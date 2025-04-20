import { createServer } from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize database connection
let pool;
try {
  // Create a PostgreSQL connection pool
  pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Required for Render's PostgreSQL
    }
  });
  
  // Test the connection
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('Database connection error:', err);
    } else {
      console.log('Database connected successfully at:', res.rows[0].now);
    }
  });
} catch (error) {
  console.error('Failed to initialize database pool:', error);
}

// Simple test route
const testRoute = (req, res) => {
  res.json({ 
    message: "API is working!",
    timestamp: new Date().toISOString()
  });
};

// Health check route
const healthCheckRoute = (req, res) => {
  res.json({ 
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: pool ? 'connected' : 'not connected'
  });
};

// Get current user info
const getCurrentUser = async (req, res) => {
  try {
    // For now, return a mock response
    res.json({
      message: "Authentication required",
      isAuthenticated: false
    });
    
    // Once authentication is properly implemented:
    /*
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ 
        message: "Authentication required",
        isAuthenticated: false
      });
    }
    
    const result = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = $1',
      [req.session.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({
      isAuthenticated: true,
      user: result.rows[0]
    });
    */
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// User Routes
const getUsersRoute = async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    
    const result = await pool.query('SELECT id, name, email, role FROM users LIMIT 10');
    res.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error', details: error.message });
  }
};

// Get internships
const getInternshipsRoute = async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    
    // Extract query parameters for filtering
    const { search, category, type, sortBy, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    // Build query with filters
    let query = 'SELECT * FROM internships';
    let params = [];
    let conditions = [];
    
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(title ILIKE $${params.length} OR company_name ILIKE $${params.length})`);
    }
    
    if (category && category !== 'All Categories') {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }
    
    if (type && type !== 'All Types') {
      params.push(type);
      conditions.push(`type = $${params.length}`);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    // Add sorting
    if (sortBy) {
      if (sortBy === 'newest') {
        query += ' ORDER BY created_at DESC';
      } else if (sortBy === 'deadline') {
        query += ' ORDER BY deadline ASC';
      }
    } else {
      query += ' ORDER BY created_at DESC';
    }
    
    // Add pagination
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) FROM internships${conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : ''}`;
    const countResult = await pool.query(countQuery, params.slice(0, conditions.length));
    const total = parseInt(countResult.rows[0].count);
    
    // Execute main query
    const result = await pool.query(query, params);
    
    res.json({
      internships: result.rows,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching internships:', error);
    res.status(500).json({ error: 'Error fetching internships', details: error.message });
  }
};

// Register all API routes
export function registerRoutes(app) {
  // Create HTTP server from Express app
  const server = createServer(app);
  
  // Basic routes
  app.get('/api/test', testRoute);
  app.get('/api/health', healthCheckRoute);
  
  // Auth routes
  app.get('/api/user', getCurrentUser);
  
  // User routes
  app.get('/api/users', getUsersRoute);
  
  // Internship routes
  app.get('/api/internships', getInternshipsRoute);
  
  // API fallback route
  app.use('/api/*', (req, res) => {
    res.status(404).json({ 
      error: 'API endpoint not found',
      path: req.path,
      method: req.method
    });
  });
  
  return server;
} 