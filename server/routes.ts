import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { wellbeingEntries } from "@db/schema";
import { and, eq, desc } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  app.get("/api/entries", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Nie zalogowano");
    }

    try {
      const entries = await db.query.wellbeingEntries.findMany({
        where: eq(wellbeingEntries.userId, req.user.id),
        orderBy: desc(wellbeingEntries.date),
      });
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Błąd podczas pobierania wpisów" });
    }
  });

  app.post("/api/entries", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Nie zalogowano");
    }

    try {
      const existingEntry = await db.query.wellbeingEntries.findFirst({
        where: and(
          eq(wellbeingEntries.userId, req.user.id),
          eq(wellbeingEntries.date, req.body.date)
        ),
      });

      if (existingEntry) {
        return res.status(400).json({ error: "Wpis na ten dzień już istnieje" });
      }

      const [entry] = await db
        .insert(wellbeingEntries)
        .values({
          ...req.body,
          userId: req.user.id,
        })
        .returning();

      res.json(entry);
    } catch (error) {
      res.status(500).json({ error: "Błąd podczas tworzenia wpisu" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}