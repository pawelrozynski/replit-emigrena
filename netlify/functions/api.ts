import type { Handler } from "@netlify/functions";
import { db } from "./db";
import { cmsContents } from "../../db/schema";
import { desc } from "drizzle-orm";

export const handler: Handler = async (event, context) => {
  // Debug logging
  console.log('Request received:', {
    path: event.path,
    httpMethod: event.httpMethod,
    headers: event.headers,
  });

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    // Extract path without the /api prefix
    const path = event.path.replace(/^\/\.netlify\/functions\/api/, '') || '/';
    console.log('Processing path:', path);

    // GET /cms - Pobieranie treści CMS
    if (path === '/cms' && event.httpMethod === 'GET') {
      console.log('Fetching CMS contents...');
      const contents = await db.query.cmsContents.findMany({
        orderBy: desc(cmsContents.updatedAt),
      });
      console.log('Found CMS contents:', contents);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(contents)
      };
    }

    // Handle 404 for unmatched routes
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ 
        error: "Not found",
        path: path 
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