import { Handler } from "@netlify/functions";

export const handler: Handler = async (event, context) => {
  console.log('Hello function called with:', {
    path: event.path,
    method: event.httpMethod,
    headers: event.headers
  });

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
    },
    body: JSON.stringify({
      message: "Hello from Netlify function!",
      timestamp: new Date().toISOString(),
      path: event.path,
      method: event.httpMethod
    })
  };
};