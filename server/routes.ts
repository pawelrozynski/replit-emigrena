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
      console.error("Error fetching entries:", error);
      res.status(500).json({ error: "Błąd podczas pobierania wpisów" });
    }
  });

  app.post("/api/entries", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Nie zalogowano");
    }

    try {
      // Convert date string to Date object and strip time part
      const entryDate = new Date(req.body.date);
      entryDate.setHours(0, 0, 0, 0);

      // Check if the date is in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (entryDate > today) {
        return res.status(400).json({ error: "Nie można dodawać wpisów z przyszłą datą" });
      }

      // Check if entry already exists for this date
      const existingEntry = await db.query.wellbeingEntries.findFirst({
        where: and(
          eq(wellbeingEntries.userId, req.user.id),
          eq(wellbeingEntries.date, entryDate)
        ),
      });

      if (existingEntry) {
        return res.status(400).json({ error: "Wpis na ten dzień już istnieje" });
      }

      // Prepare the entry data
      const entryData = {
        ...req.body,
        userId: req.user.id,
        date: entryDate,
        // Set interval fields to null if not provided
        totalSleepDuration: req.body.totalSleepDuration || null,
        deepSleepDuration: req.body.deepSleepDuration || null,
      };

      // Insert the entry
      const [entry] = await db
        .insert(wellbeingEntries)
        .values(entryData)
        .returning();

      res.json(entry);
    } catch (error) {
      console.error("Error creating entry:", error);
      res.status(500).json({ error: "Błąd podczas tworzenia wpisu: " + (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}