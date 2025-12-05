/**
 * API Response Utilities
 *
 * Standardized response formatting for API routes.
 * Returns generic messages to clients while logging detailed errors server-side.
 */

import { NextResponse } from 'next/server';
import { AppError, RateLimitError } from '@/lib/errors';

/**
 * Generic error messages for each status code.
 * These are safe to show to clients.
 */
const GENERIC_MESSAGES: Record<number, string> = {
  400: 'Invalid request',
  401: 'Authentication required',
  403: 'Access denied',
  404: 'Resource not found',
  409: 'Resource conflict',
  429: 'Too many requests',
  500: 'An unexpected error occurred',
};

/**
 * Create a standardized error response.
 * Logs detailed error server-side, returns generic message to client.
 *
 * @param error - The error that occurred
 * @returns NextResponse with appropriate status and generic message
 *
 * @example
 * try {
 *   // ... your code
 * } catch (error) {
 *   return errorResponse(error);
 * }
 */
export function errorResponse(error: unknown): NextResponse {
  // Always log the full error server-side
  console.error('API Error:', error);

  // Handle rate limit errors specially (need Retry-After header)
  if (error instanceof RateLimitError) {
    return NextResponse.json(
      { error: GENERIC_MESSAGES[429] },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(error.retryAfter / 1000)),
        },
      }
    );
  }

  // Handle operational AppErrors
  if (error instanceof AppError && error.isOperational) {
    const message = GENERIC_MESSAGES[error.statusCode] || GENERIC_MESSAGES[500];
    return NextResponse.json({ error: message }, { status: error.statusCode });
  }

  // All other errors get generic 500
  return NextResponse.json(
    { error: GENERIC_MESSAGES[500] },
    { status: 500 }
  );
}

/**
 * Create a success response with data.
 *
 * @param data - The data to return
 * @param status - HTTP status code (default 200)
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json({ data }, { status });
}

/**
 * Create a success response for creation operations.
 *
 * @param data - The created resource
 */
export function createdResponse<T>(data: T): NextResponse {
  return NextResponse.json({ data }, { status: 201 });
}

/**
 * Create a success response with no content.
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 });
}
