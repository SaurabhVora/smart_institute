import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import cors from 'cors';
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { runMigrations } from './migrate'; // Import migration runner
import path from 'path';

// Add these at the top level to prevent crashes from killing the application
process.on('uncaughtException', (err) => {
  console.error('FATAL: Uncaught Exception:', err);
  // Keep the process running despite the error
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('FATAL: Unhandled Promise Rejection:', reason);
  // Keep the process running despite the error
});

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Wrap server startup in a function with proper error handling
async function startServer() {
  try {
    // Run database migrations
    await runMigrations();
    log('Database migrations completed successfully');
  } catch (error) {
    log('Error running migrations:', String(error));
    // Continue starting server even if migrations fail
  }

  try {
    const server = registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      log(`Error handler caught: ${message}`);
      res.status(status).json({ message });
    });

    // Setup routes based on environment
    if (app.get("env") === "development") {
      log('Running in development mode with Vite middleware');
      await setupVite(app, server);
    } else {
      log('Running in production mode with static file serving');
      serveStatic(app);
    }

    // Use environment variables for port and host with defaults
    const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
    // In production environments like Render, we should bind to 0.0.0.0
    const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
    
    // Start server with proper error handling
    server.listen(PORT, HOST, () => {
      log(`Server started on ${HOST}:${PORT}`);
    }).on('error', (e: any) => {
      if (e.code === 'EADDRINUSE') {
        log(`Port ${PORT} is busy, trying ${PORT + 1}`);
        server.listen(PORT + 1, HOST, () => {
          log(`Server started on ${HOST}:${PORT + 1}`);
        }).on('error', (innerErr) => {
          log(`Failed to start server on alternate port: ${innerErr.message}`);
        });
      } else {
        log(`Error starting server: ${e.message}`);
      }
    });

    // Keep Node.js process running by adding a setInterval
    // This prevents the process from exiting if all other events are processed
    const keepAlive = setInterval(() => {
      // Do nothing, just keep the event loop active
    }, 60000); // Check every minute
    
    // If we need to gracefully shutdown
    process.on('SIGTERM', () => {
      clearInterval(keepAlive);
      log('SIGTERM received, shutting down gracefully');
      // Add cleanup code here
    });
  } catch (error) {
    log('Critical server error:', String(error));
    // Don't exit, keep the process running
  }
}

// Start the server
startServer().catch(err => {
  log('Fatal error during startup:', String(err));
});
