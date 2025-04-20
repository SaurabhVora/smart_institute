import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import fs from 'fs';
import { createServer } from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Starting server...");
console.log("Node Environment:", process.env.NODE_ENV);
console.log("DATABASE_URL set:", !!process.env.DATABASE_URL);
console.log("AWS_ACCESS_KEY_ID set:", !!process.env.AWS_ACCESS_KEY_ID);

// Define a fallback routes function
const fallbackRegisterRoutes = (app) => {
  const server = createServer(app);
  
  // Simple test API route
  app.get('/api/test', (req, res) => {
    res.json({ 
      message: 'Fallback API route is working',
      env: process.env.NODE_ENV,
      db_url_set: !!process.env.DATABASE_URL,
      timestamp: new Date().toISOString()
    });
  });

  app.get('/api/health', (req, res) => {
    res.json({ 
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: !!process.env.DATABASE_URL
    });
  });
  
  return server;
};

// Create the Express app
const app = express();
const PORT = process.env.PORT || 10000;

// Enable CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.BASE_URL, process.env.APP_URL].filter(Boolean)
    : 'http://localhost:5173',
  credentials: true
}));

// Parse JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Log request info
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler caught:', err);
  res.status(500).json({
    error: 'Server error',
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

// Serve static files from the dist/public directory
console.log('Public directory path:', path.join(__dirname, 'dist', 'public'));
const publicPath = path.join(__dirname, 'dist', 'public');
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
  console.log('Serving static files from', publicPath);
} else {
  console.warn('Public directory not found at', publicPath);
}

// Serve files from uploads directory if it exists
const uploadsPath = path.join(__dirname, 'uploads');
if (fs.existsSync(uploadsPath)) {
  app.use('/uploads', express.static(uploadsPath));
  console.log('Serving uploads from', uploadsPath);
} else {
  console.warn('Uploads directory not found at', uploadsPath);
  // Create uploads directory if it doesn't exist
  try {
    fs.mkdirSync(uploadsPath, { recursive: true });
    console.log('Created uploads directory at', uploadsPath);
  } catch (error) {
    console.error('Failed to create uploads directory:', error);
  }
}

// Try to import the routes
let server;
try {
  const routesModule = await import('./server-routes.js');
  const registerRoutes = routesModule.registerRoutes;
  console.log('Routes module imported successfully');
  server = registerRoutes(app);
  console.log('API routes registered successfully');
} catch (error) {
  console.error('Error importing routes module:', error);
  server = fallbackRegisterRoutes(app);
  console.log('Using fallback API routes');
}

// For all other routes that are not API, serve the index.html
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    const indexPath = path.join(__dirname, 'dist', 'public', 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      console.warn('index.html not found at', indexPath);
      res.status(404).send('Frontend not found. Please check build configuration.');
    }
  } else {
    res.status(404).json({ error: 'API route not found', path: req.path });
  }
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`PORT=${PORT}`);
  
  // Add more detailed info
  console.log(`Server URL: http://0.0.0.0:${PORT}`);
  console.log(`API Test URL: http://0.0.0.0:${PORT}/api/test`);
  console.log(`Health Check URL: http://0.0.0.0:${PORT}/api/health`);
});

// Keep the process running
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
}); 