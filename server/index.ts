import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { limiter, sessionMiddleware, healthCheck } from "./middleware";
import helmet from "helmet";

const app = express();

// Trust proxy - required for rate limiting behind Replit's proxy
app.set('trust proxy', 1);

// Security middleware for production
if (process.env.NODE_ENV === 'production') {
  app.use(helmet());
}

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(sessionMiddleware);

// Apply rate limiting based on path
app.use('/api', limiter.api);
app.use('/', limiter.general);

// Health check endpoint
app.get('/health', healthCheck);

// Request logging middleware
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

(async () => {
  const server = registerRoutes(app);

  // Global error handler with production-safe error messages
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production'
      ? 'Wystąpił błąd serwera. Spróbuj ponownie później.'
      : err.message || "Internal Server Error";

    // Log the full error in development
    if (process.env.NODE_ENV !== 'production') {
      console.error(err);
    }

    res.status(status).json({
      status: 'error',
      message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
  });

  // Setup Vite or serve static files based on environment
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, "0.0.0.0", () => {
    log(`Server running in ${app.get("env")} mode on port ${port}`);
  });
})();