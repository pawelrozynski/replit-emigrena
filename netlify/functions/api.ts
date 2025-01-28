import { Handler } from "@netlify/functions";
import { db } from "./db";
import { cmsContents, documentationVersions } from "../../db/schema";
import { desc } from "drizzle-orm";

export const handler: Handler = async (event, context) => {
  // Konfiguracja CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json'
  };

  console.log('Otrzymano zapytanie:', {
    path: event.path,
    method: event.httpMethod,
    headers: event.headers,
    queryParams: event.queryStringParameters
  });

  try {
    // Obsługa CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return { 
        statusCode: 204, 
        headers,
        body: ''
      };
    }

    // Normalizacja ścieżki - usuwanie przedrostków i trailing slashes
    const path = event.path
      .replace(/^\/?(\.netlify\/functions\/api\/)?/, '')
      .replace(/\/$/, '');

    console.log('Przetworzona ścieżka:', {
      original: event.path,
      normalized: path
    });

    // Obsługa endpointu CMS
    if (path === 'cms' && event.httpMethod === 'GET') {
      try {
        console.log('Pobieranie zawartości CMS...');
        const contents = await db.query.cmsContents.findMany({
          orderBy: desc(cmsContents.updatedAt),
        });
        console.log(`Znaleziono ${contents.length} elementów CMS`);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(contents)
        };
      } catch (error) {
        console.error('Błąd bazy danych przy pobieraniu CMS:', error);
        throw error;
      }
    }

    // Obsługa endpointu dokumentacji
    if (path === 'documentation' && event.httpMethod === 'GET') {
      try {
        console.log('Pobieranie wersji dokumentacji...');
        const versions = await db.query.documentationVersions.findMany({
          orderBy: desc(documentationVersions.versionDate),
        });
        console.log(`Znaleziono ${versions.length} wersji dokumentacji`);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(versions)
        };
      } catch (error) {
        console.error('Błąd bazy danych przy pobieraniu dokumentacji:', error);
        throw error;
      }
    }

    console.log('Nie znaleziono endpointu dla ścieżki:', path);
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ 
        error: "Nie znaleziono endpointu",
        path,
        originalPath: event.path
      })
    };

  } catch (error) {
    console.error('Błąd API:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Błąd serwera",
        message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      })
    };
  }
};