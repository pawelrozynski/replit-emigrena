import type { Handler } from "@netlify/functions";
import { db } from "./db";
import { wellbeingEntries, documentationVersions, cmsContents } from "../../db/schema";
import { and, eq, desc, count } from "drizzle-orm";

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': event.headers.origin || '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  try {
    // Usuwamy prefiks /.netlify/functions/api z ścieżki
    const path = event.path.replace(/^\/?(\.netlify\/functions\/api)?\//, '/');
    console.log('Processing request:', { path, method: event.httpMethod });

    // Pobieranie wpisów
    if (path === '/entries' && event.httpMethod === 'GET') {
      const entries = await db.query.wellbeingEntries.findMany({
        orderBy: desc(wellbeingEntries.date),
      });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(entries)
      };
    }

    // Dodawanie nowego wpisu
    if (path === '/entries' && event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
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
          totalSleepDuration: body.totalSleepDuration || null,
          deepSleepDuration: body.deepSleepDuration || null,
        })
        .returning();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(entry)
      };
    }

    // Liczenie wpisów
    if (path === '/entries/count' && event.httpMethod === 'GET') {
      const [result] = await db
        .select({ count: count() })
        .from(wellbeingEntries);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result.count)
      };
    }

    // Pobieranie dokumentacji
    if (path === '/documentation' && event.httpMethod === 'GET') {
      const versions = await db.query.documentationVersions.findMany({
        orderBy: desc(documentationVersions.versionDate),
      });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(versions)
      };
    }

    // Dodawanie dokumentacji
    if (path === '/documentation' && event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
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
        body: JSON.stringify(version)
      };
    }

    // Pobieranie treści CMS
    if (path === '/cms' && event.httpMethod === 'GET') {
      const versions = await db.query.cmsContents.findMany({
        orderBy: desc(cmsContents.updatedAt),
      });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(versions)
      };
    }

    // Dodawanie treści CMS
    if (path === '/cms' && event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const [content] = await db
        .insert(cmsContents)
        .values({
          key: body.key,
          content: body.content,
        })
        .returning();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(content)
      };
    }

    // Aktualizacja treści CMS
    if (path.startsWith('/cms/') && event.httpMethod === 'PUT') {
      const id = parseInt(path.split('/')[2], 10);
      const body = JSON.parse(event.body || '{}');

      const updateData: { content: string; key?: string } = {
        content: body.content,
      };

      if (body.key) {
        updateData.key = body.key;
      }

      const [content] = await db
        .update(cmsContents)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(cmsContents.id, id))
        .returning();

      if (!content) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: "Nie znaleziono treści" })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(content)
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: "Not found", path })
    };
  } catch (error) {
    console.error('API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Internal server error",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        timestamp: new Date().toISOString()
      })
    };
  }
};