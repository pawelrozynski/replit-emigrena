import type { Handler } from "@netlify/functions";
import { db } from "./db";
import { cmsContents } from "../../db/schema";
import { desc } from "drizzle-orm";

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json'
  };

  // Debug logging
  console.log('Environment check:', {
    nodeEnv: process.env.NODE_ENV,
    hasDbUrl: !!process.env.DATABASE_URL,
  });

  console.log('Request details:', {
    path: event.path,
    rawUrl: event.rawUrl,
    httpMethod: event.httpMethod,
    headers: event.headers,
    queryParams: event.queryStringParameters,
  });

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  try {
    // Simple path handling
    const path = event.path.replace(/^\/\.netlify\/functions\/api/, '') || '/';
    console.log('Processed path:', path);

    // Test endpoint to verify function is working
    if (path === '/test') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: "API function is working",
          timestamp: new Date().toISOString()
        })
      };
    }

    // Pobieranie treści CMS
    if (path === '/cms' && event.httpMethod === 'GET') {
      console.log('Fetching CMS contents...');
      try {
        const contents = await db.query.cmsContents.findMany({
          orderBy: desc(cmsContents.updatedAt),
        });
        console.log('Found CMS contents:', contents.length);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(contents)
        };
      } catch (dbError) {
        console.error('Database error:', dbError);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            error: "Database error",
            details: process.env.NODE_ENV === 'development' ? (dbError as Error).message : undefined
          })
        };
      }
    }


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