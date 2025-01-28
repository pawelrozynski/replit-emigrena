import type { Handler } from "@netlify/functions";
import { db } from "./db";
import { cmsContents } from "../../db/schema";
import { desc } from "drizzle-orm";

export const handler: Handler = async (event, context) => {
  // Debug logging
  console.log('Request details:', {
    path: event.path,
    httpMethod: event.httpMethod,
    headers: event.headers,
  });

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS requests for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  try {
    // Test database connection
    try {
      const testQuery = await db.query.cmsContents.findMany({
        limit: 1
      });
      console.log('Database connection test:', testQuery);
    } catch (dbTestError) {
      console.error('Database connection test failed:', dbTestError);
    }

    // Simplified path handling
    const path = event.path.split('/').pop() || '';
    console.log('Processing request for path:', path);

    // GET /cms - Pobieranie treści CMS
    if (path === 'cms' && event.httpMethod === 'GET') {
      console.log('Fetching CMS contents...');
      try {
        const contents = await db.query.cmsContents.findMany({
          orderBy: desc(cmsContents.updatedAt),
        });
        console.log('Found CMS contents:', contents);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(contents)
        };
      } catch (dbError) {
        console.error('Database error:', dbError);
        throw dbError;
      }
    }

    // Handle 404 for unmatched routes
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ 
        error: "Not found",
        path: path,
        fullPath: event.path,
      })
    };

  } catch (error) {
    console.error('Error handling request:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: "Internal server error",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};