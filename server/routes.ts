import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { wellbeingEntries, insertWellbeingSchema } from "@db/schema";
import { and, eq } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  app.get("/api/entries", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const entries = await db.query.wellbeingEntries.findMany({
        where: eq(wellbeingEntries.userId, req.user.id),
        orderBy: [wellbeingEntries.date, "desc"],
      });
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch entries" });
    }
  });

  app.post("/api/entries", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const result = insertWellbeingSchema.safeParse({
        ...req.body,
        userId: req.user.id,
      });

      if (!result.success) {
        return res.status(400).json({ errors: result.error.issues });
      }

      const existingEntry = await db.query.wellbeingEntries.findFirst({
        where: and(
          eq(wellbeingEntries.userId, req.user.id),
          eq(wellbeingEntries.date, result.data.date)
        ),
      });

      if (existingEntry) {
        return res.status(400).json({ error: "Entry already exists for this date" });
      }

      const [entry] = await db
        .insert(wellbeingEntries)
        .values(result.data)
        .returning();

      res.json(entry);
    } catch (error) {
      res.status(500).json({ error: "Failed to create entry" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
