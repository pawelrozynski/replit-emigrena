import type { Handler } from "@netlify/functions";

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

  // Basic test endpoint
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      message: "API is working",
      path: event.path,
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV
    })
  };
};