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

  // Debug logging
  console.log('Request details:', {
    path: event.path,
    rawUrl: event.rawUrl,
    httpMethod: event.httpMethod,
    headers: event.headers,
    body: event.body,
    params: event.queryStringParameters,
  });

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  try {
    // Extract the actual path by removing both /api and /.netlify/functions/api prefixes
    const path = event.path
      .replace(/^\/\.netlify\/functions\/api/, '')
      .replace(/^\/api/, '')
      || '/';

    console.log('Processed path:', path);

    // Pobieranie treści CMS
    if (path === '/cms' && event.httpMethod === 'GET') {
      console.log('Fetching CMS contents...');
      const contents = await db.query.cmsContents.findMany({
        orderBy: desc(cmsContents.updatedAt),
      });
      console.log('Found CMS contents:', contents.length);
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

    // Logowanie nieobsłużonej ścieżki
    console.log('Unhandled path:', {
      originalPath: event.path,
      processedPath: path,
      rawUrl: event.rawUrl,
    });

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        error: "Not found",
        path,
        originalPath: event.path,
        rawUrl: event.rawUrl
      })
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