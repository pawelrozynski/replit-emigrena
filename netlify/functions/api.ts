import type { Handler } from "@netlify/functions";
import { db } from "./db";
import { wellbeingEntries, documentationVersions } from "../../db/schema";
import { desc } from "drizzle-orm";

export const handler: Handler = async (event, context) => {
  // Poprawna konfiguracja CORS
  const headers = {
    'Access-Control-Allow-Origin': event.headers.origin || '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
  };

  // Dodaj więcej logów dla debugowania
  console.log('Request details:', {
    path: event.path,
    method: event.httpMethod,
    headers: event.headers,
    queryStringParameters: event.queryStringParameters,
  });

  // Obsługa preflight CORS
  if (event.httpMethod === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  try {
    const path = event.path.replace('/.netlify/functions/api', '');
    console.log('Processing request for path:', path);

    // Obsługa endpointów API
    if (path === '/entries' && event.httpMethod === 'GET') {
      console.log('Fetching entries from database');
      const entries = await db.query.wellbeingEntries.findMany({
        orderBy: desc(wellbeingEntries.date),
      });
      console.log('Found entries:', entries.length);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(entries)
      };
    }

    if (path === '/entries' && event.httpMethod === 'POST') {
      console.log('Creating new entry');
      const body = JSON.parse(event.body || '{}');
      console.log('Request body:', body);

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

      console.log('Created entry:', entry);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(entry)
      };
    }

    if (path === '/documentation' && event.httpMethod === 'GET') {
      console.log('Fetching documentation versions');
      const versions = await db.query.documentationVersions.findMany({
        orderBy: desc(documentationVersions.versionDate),
      });
      console.log('Found versions:', versions.length);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(versions)
      };
    }

    console.log('Route not found:', path);
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found', path })
    };
  } catch (error) {
    console.error('API error:', error);
    // W środowisku produkcyjnym nie pokazujemy szczegółów błędu
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error.message 
      : 'Internal server error';

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: errorMessage,
        timestamp: new Date().toISOString()
      })
    };
  }
};