import type { Handler } from "@netlify/functions";
import { db } from "./db";
import { wellbeingEntries, documentationVersions, cmsContents } from "../../db/schema";
import { and, eq, desc, count } from "drizzle-orm";

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
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
    const path = event.rawUrl.replace(/.*\/api/, '');
    console.log('Processing request:', { path, method: event.httpMethod, rawUrl: event.rawUrl });

    // Pobieranie treści CMS
    if (path === '/cms' && event.httpMethod === 'GET') {
      const contents = await db.query.cmsContents.findMany({
        orderBy: desc(cmsContents.updatedAt),
      });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(contents)
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
    if (path.match(/^\/cms\/\d+$/) && event.httpMethod === 'PUT') {
      const id = parseInt(path.split('/')[2], 10);
      const body = JSON.parse(event.body || '{}');

      const [content] = await db
        .update(cmsContents)
        .set({
          ...body,
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
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      })
    };
  }
};