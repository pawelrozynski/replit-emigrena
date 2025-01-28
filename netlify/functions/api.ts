import type { Handler } from "@netlify/functions";
import { db } from "./db";
import { wellbeingEntries, cmsContents, documentationVersions } from "../../db/schema";
import { and, eq, desc, count } from "drizzle-orm";

export const handler: Handler = async (event, context) => {
  const path = event.path.replace("/.netlify/functions/api", "");
  const method = event.httpMethod;

  // Dodaj nagłówki CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
  };

  try {
    // Obsługa endpointów API
    if (path === "/entries" && method === "GET") {
      const entries = await db.query.wellbeingEntries.findMany({
        orderBy: desc(wellbeingEntries.date),
      });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(entries),
      };
    }

    if (path === "/entries" && method === "POST") {
      const body = JSON.parse(event.body || "{}");
      const inputDate = new Date(body.date);
      const entryDate = new Date(Date.UTC(
        inputDate.getUTCFullYear(),
        inputDate.getUTCMonth(),
        inputDate.getUTCDate(),
        12, 0, 0, 0
      ));

      const [entry] = await db
        .insert(wellbeingEntries)
        .values({
          ...body,
          date: entryDate,
        })
        .returning();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(entry),
      };
    }

    if (path === "/documentation" && method === "GET") {
      const versions = await db.query.documentationVersions.findMany({
        orderBy: desc(documentationVersions.versionDate),
      });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(versions),
      };
    }

    if (path === "/documentation" && method === "POST") {
      const body = JSON.parse(event.body || "{}");
      const [version] = await db
        .insert(documentationVersions)
        .values({
          content: body.content,
          versionDate: new Date(body.versionDate),
        })
        .returning();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(version),
      };
    }

    if (path === "/cms" && method === "GET") {
      const contents = await db.query.cmsContents.findMany({
        orderBy: desc(cmsContents.updatedAt),
      });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(contents),
      };
    }

    // Obsługa CORS preflight
    if (method === "OPTIONS") {
      return {
        statusCode: 204,
        headers,
        body: "",
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: "Not found" }),
    };
  } catch (error) {
    console.error("API error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};