import { createServer } from 'http';

// Simple test route
const testRoute = (req, res) => {
  res.json({ message: "API is working!" });
};

// Health check route
const healthCheckRoute = (req, res) => {
  res.json({ 
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
};

// Register all API routes
export function registerRoutes(app) {
  // Create HTTP server from Express app
  const server = createServer(app);
  
  // Register API routes
  app.get('/api/test', testRoute);
  app.get('/api/health', healthCheckRoute);
  
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