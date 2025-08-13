import { NextResponse } from 'next/server';
type RouteHandler = (req: Request) => Promise<Response>;

/**
 * Middleware that enforces API key validation before executing the route handler.
 * Applies to App Router-style handlers using the Web API `Request` object.
 */
export const withApiKey = (handler: RouteHandler): RouteHandler => {
  return async (req: Request) => {
    // Reject request if API key is missing or invalid. 403 Forbidden.
    if (!validateApiKey(req)) {
      return NextResponse.json(
        { error: 'Forbidden: Invalid API Key' },
        { status: 403 }
      );
    }
    // Proceed to the original handler if API key is valid
    return handler(req);
  };
};


export const validateApiKey = (req: Request): boolean => {
  // Key from environment variables
  const validKey = process.env.NEXT_PUBLIC_REST_API_KEY 
  // Key from request headers
  const incomingKey = req.headers.get('x-api-key');
  // Check if the incoming key matches the valid key
  return typeof incomingKey === 'string' && incomingKey === validKey;
};

