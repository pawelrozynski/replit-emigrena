const handler = async (event, context) => {
  console.log('Request details:', {
    path: event.path,
    httpMethod: event.httpMethod,
    headers: event.headers,
  });

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    },
    body: JSON.stringify({
      message: "Test function is working (JS version)",
      timestamp: new Date().toISOString(),
      path: event.path,
      env: process.env.NODE_ENV
    })
  };
};

exports.handler = handler;
