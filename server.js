import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import fs from 'fs';

// Import the routes registration function
import { registerRoutes } from './server-routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

// Enable CORS
app.use(cors());

// Parse JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from the dist/public directory
app.use(express.static(path.join(__dirname, 'dist', 'public')));

// Serve files from uploads directory if it exists
const uploadsPath = path.join(__dirname, 'uploads');
if (fs.existsSync(uploadsPath)) {
  app.use('/uploads', express.static(uploadsPath));
}

// Register API routes from your backend
try {
  const server = registerRoutes(app);
  console.log('API routes registered successfully');
  
  // Start the server
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`PORT=${PORT}`);
  });
} catch (error) {
  console.error('Error registering API routes:', error);
  
  // Fallback to running without API routes
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} (without API routes)`);
    console.log(`PORT=${PORT}`);
  });
}

// For all other routes that are not API, serve the index.html
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'dist', 'public', 'index.html'));
  } else {
    res.status(404).json({ error: 'API route not found' });
  }
});

// Keep the process running
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
}); 