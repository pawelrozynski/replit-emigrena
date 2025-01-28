import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { wellbeingEntries, cmsContents, documentationVersions } from "@db/schema";
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
      // Tworzymy datę bez modyfikowania strefy czasowej
      const dateParts = req.body.date.split('T')[0].split('-');
      const entryDate = new Date(Date.UTC(
        parseInt(dateParts[0]), // rok
        parseInt(dateParts[1]) - 1, // miesiąc (0-11)
        parseInt(dateParts[2]), // dzień
        12, // ustawiamy na południe UTC
        0,
        0
      ));

      console.log('Otrzymana data:', req.body.date);
      console.log('Przetworzona data UTC:', entryDate.toISOString());

      // Sprawdzamy czy data nie jest z przyszłości
      const today = new Date();
      today.setUTCHours(12, 0, 0, 0);

      if (entryDate > today) {
        return res.status(400).json({ error: "Nie można dodawać wpisów z przyszłą datą" });
      }

      // Sprawdzamy czy wpis na ten dzień już istnieje
      const existingEntry = await db.query.wellbeingEntries.findFirst({
        where: and(
          eq(wellbeingEntries.userId, req.user.id),
          eq(wellbeingEntries.date, entryDate)
        ),
      });

      if (existingEntry) {
        return res.status(400).json({ error: "Wpis na ten dzień już istnieje" });
      }

      // Przygotowujemy dane wpisu
      const entryData = {
        ...req.body,
        userId: req.user.id,
        date: entryDate,
        totalSleepDuration: req.body.totalSleepDuration || null,
        deepSleepDuration: req.body.deepSleepDuration || null,
      };

      // Zapisujemy wpis
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

  // CMS routes
  app.get("/api/cms", async (req, res) => {
    try {
      const contents = await db.query.cmsContents.findMany({
        orderBy: desc(cmsContents.updatedAt),
      });
      res.json(contents);
    } catch (error) {
      console.error("Error fetching CMS contents:", error);
      res.status(500).json({ error: "Błąd podczas pobierania treści CMS" });
    }
  });

  app.post("/api/cms", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).send("Brak uprawnień");
    }

    try {
      const [content] = await db
        .insert(cmsContents)
        .values({
          key: req.body.key,
          content: req.body.content,
        })
        .returning();

      res.json(content);
    } catch (error) {
      console.error("Error creating CMS content:", error);
      res.status(500).json({ error: "Błąd podczas tworzenia treści CMS" });
    }
  });

  app.put("/api/cms/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).send("Brak uprawnień");
    }

    try {
      const [content] = await db
        .update(cmsContents)
        .set({
          content: req.body.content,
          updatedAt: new Date(),
        })
        .where(eq(cmsContents.id, req.params.id))
        .returning();

      if (!content) {
        return res.status(404).json({ error: "Nie znaleziono treści" });
      }

      res.json(content);
    } catch (error) {
      console.error("Error updating CMS content:", error);
      res.status(500).json({ error: "Błąd podczas aktualizacji treści CMS" });
    }
  });

  // Documentation routes
  app.get("/api/documentation", async (req, res) => {
    try {
      const versions = await db.query.documentationVersions.findMany({
        orderBy: desc(documentationVersions.versionDate),
      });
      res.json(versions);
    } catch (error) {
      console.error("Error fetching documentation versions:", error);
      res.status(500).json({ error: "Błąd podczas pobierania wersji dokumentacji" });
    }
  });

  app.post("/api/documentation", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).send("Brak uprawnień");
    }

    try {
      const [version] = await db
        .insert(documentationVersions)
        .values({
          content: req.body.content,
          versionDate: new Date(req.body.versionDate),
        })
        .returning();

      res.json(version);
    } catch (error) {
      console.error("Error creating documentation version:", error);
      res.status(500).json({ error: "Błąd podczas tworzenia wersji dokumentacji" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}