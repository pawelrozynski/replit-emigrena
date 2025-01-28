import passport from "passport";
import { IVerifyOptions, Strategy as LocalStrategy } from "passport-local";
import { type Express } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { users, type User } from "@db/schema";
import { db } from "@db";
import { eq } from "drizzle-orm";
import { emailService } from "./services/email";

const scryptAsync = promisify(scrypt);

const crypto = {
  hash: async (password: string) => {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 32)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
  },
  compare: async (suppliedPassword: string, storedPassword: string) => {
    try {
      const [hashedPassword, salt] = storedPassword.split(".");

      if (!hashedPassword || !salt) {
        console.error('Invalid stored password format');
        return false;
      }

      const storedBuf = Buffer.from(hashedPassword, "hex");
      const suppliedBuf = (await scryptAsync(suppliedPassword, salt, 32)) as Buffer;

      return timingSafeEqual(storedBuf, suppliedBuf);
    } catch (error) {
      console.error('Error comparing passwords:', error);
      return false;
    }
  }
};

declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      password: string;
      isAdmin: boolean;
      isEmailVerified: boolean;
      verificationToken: string | null;
      verificationTokenExpiry: Date | null;
    }
  }
}

export function setupAuth(app: Express) {
  const MemoryStore = createMemoryStore(session);
  const sessionSettings: session.SessionOptions = {
    secret: process.env.REPL_ID || "emigrena-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {},
    store: new MemoryStore({
      checkPeriod: 86400000,
    }),
  };

  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
    sessionSettings.cookie = { secure: true };
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password'
      },
      async (email, password, done) => {
        try {
          console.log('Attempting login for email:', email);

          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

          if (!user) {
            console.log('User not found');
            return done(null, false, { message: "Nie znaleziono użytkownika." });
          }

          const isMatch = await crypto.compare(password, user.password);
          console.log('Password comparison result:', isMatch);

          if (!isMatch) {
            return done(null, false, { message: "Nieprawidłowe hasło." });
          }

          // Tymczasowo wyłączamy sprawdzanie weryfikacji email
          // if (!user.isEmailVerified) {
          //   return done(null, false, { message: "Adres email nie został zweryfikowany. Sprawdź swoją skrzynkę pocztową." });
          // }

          return done(null, user);
        } catch (err) {
          console.error('Authentication error:', err);
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).send("Email i hasło są wymagane");
      }

      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingUser) {
        return res.status(400).send("Użytkownik o podanym adresie email już istnieje");
      }

      const hashedPassword = await crypto.hash(password);

      // Tymczasowo ustawiamy konto jako zweryfikowane bez tokenu
      const [newUser] = await db
        .insert(users)
        .values({ 
          email, 
          password: hashedPassword,
          isEmailVerified: true, // Auto-verify for now
          isAdmin: false 
        })
        .returning();

      // Weryfikacja email zostanie dodana później
      // try {
      //   await emailService.sendVerificationEmail(email, verificationToken);
      // } catch (error) {
      //   console.error('Failed to send verification email:', error);
      // }

      res.json({ 
        message: "Rejestracja pomyślna. Możesz się teraz zalogować." 
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: Express.User, info: IVerifyOptions) => {
      if (err) return next(err);
      if (!user) return res.status(400).send(info.message);

      req.login(user, (err) => {
        if (err) return next(err);
        return res.json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).send("Wylogowanie nie powiodło się");
      res.json({ message: "Wylogowano pomyślnie" });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Nie zalogowano");
    }
    res.json(req.user);
  });
  app.get("/verify-email", async (req, res) => {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).send("Nieprawidłowy token weryfikacyjny");
    }

    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.verificationToken, token))
        .limit(1);

      if (!user) {
        return res.status(400).send("Nieprawidłowy token weryfikacyjny");
      }

      if (user.verificationTokenExpiry && new Date(user.verificationTokenExpiry) < new Date()) {
        return res.status(400).send("Token weryfikacyjny wygasł");
      }

      await db
        .update(users)
        .set({
          isEmailVerified: true,
          verificationToken: null,
          verificationTokenExpiry: null
        })
        .where(eq(users.id, user.id));

      res.redirect('/?verified=true');
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).send("Wystąpił błąd podczas weryfikacji adresu email");
    }
  });
}