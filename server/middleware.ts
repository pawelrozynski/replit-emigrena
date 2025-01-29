import rateLimit from "express-rate-limit";
import session from "express-session";
import MemoryStore from "memorystore";

const MemoryStoreSession = MemoryStore(session);

// Bardziej restrykcyjne limity dla API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: process.env.NODE_ENV === 'production' ? 30 : 100, // Bardziej restrykcyjny limit w produkcji
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      status: 'error',
      message: 'Zbyt wiele zapytań. Spróbuj ponownie później.'
    });
  }
});

// Bardziej liberalny limit dla endpointów statycznych
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 200,
  standardHeaders: true,
  legacyHeaders: false,
});

export const limiter = {
  api: apiLimiter,
  general: generalLimiter,
};

export const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "development-secret-key",
  resave: false,
  saveUninitialized: false,
  store: new MemoryStoreSession({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === "production" ? 'strict' : 'lax'
  },
  proxy: true // Trust proxy for session
});

export const healthCheck = (req: any, res: any) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
};