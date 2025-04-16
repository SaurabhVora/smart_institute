import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { registerRoutes as registerModularRoutes } from "./routes/index";

export function registerRoutes(app: Express): Server {
  // Set up authentication
  setupAuth(app);

  // Register all modular routes
  registerModularRoutes(app);
  
  // Create and return HTTP server
  return createServer(app);
}
