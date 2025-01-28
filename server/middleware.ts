import rateLimit from "express-rate-limit";
import session from "express-session";
import MemoryStore from "memorystore";

const MemoryStoreSession = MemoryStore(session);

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Zbyt wiele zapytań z tego adresu IP. Spróbuj ponownie później.",
  standardHeaders: true,
  legacyHeaders: false,
});

export const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "your-secret-key",
  resave: false,
  saveUninitialized: false,
  store: new MemoryStoreSession({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
});

// Health check middleware
export const healthCheck = (req: any, res: any) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
};
