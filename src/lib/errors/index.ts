/**
 * Structured Error Types - Consistent error handling across the application
 *
 * Following the Single Responsibility Principle, all error definitions
 * and error handling utilities are centralized here.
 */

import { NextResponse } from 'next/server';

// Error codes for consistent error identification
export enum ErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',

  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',

  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',

  // Business logic errors
  INVALID_STATE_TRANSITION = 'INVALID_STATE_TRANSITION',
  INSUFFICIENT_INVENTORY = 'INSUFFICIENT_INVENTORY',
  ORDER_NOT_CANCELABLE = 'ORDER_NOT_CANCELABLE',

  // Rate limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // External service errors
  PAYMENT_ERROR = 'PAYMENT_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',

  // Generic errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

// HTTP status codes mapping
const ERROR_STATUS_MAP: Record<ErrorCode, number> = {
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.ALREADY_EXISTS]: 409,
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.INVALID_INPUT]: 400,
  [ErrorCode.INVALID_STATE_TRANSITION]: 400,
  [ErrorCode.INSUFFICIENT_INVENTORY]: 400,
  [ErrorCode.ORDER_NOT_CANCELABLE]: 400,
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 429,
  [ErrorCode.PAYMENT_ERROR]: 402,
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: 502,
  [ErrorCode.INTERNAL_ERROR]: 500,
};

/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly status: number;
  public readonly details?: Record<string, unknown>;

  constructor(
    code: ErrorCode,
    message: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = ERROR_STATUS_MAP[code];
    this.details = details;

    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not Found Error - Resource doesn't exist
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id
      ? `${resource} with ID ${id} not found`
      : `${resource} not found`;
    super(ErrorCode.NOT_FOUND, message, { resource, id });
    this.name = 'NotFoundError';
  }
}

/**
 * Validation Error - Invalid input data
 */
export class ValidationError extends AppError {
  constructor(message: string, errors?: Array<{ field: string; message: string }>) {
    super(ErrorCode.VALIDATION_ERROR, message, { errors });
    this.name = 'ValidationError';
  }
}

/**
 * Authentication Error - User not authenticated
 */
export class AuthError extends AppError {
  constructor(message = 'Authentication required') {
    super(ErrorCode.UNAUTHORIZED, message);
    this.name = 'AuthError';
  }
}

/**
 * Forbidden Error - User lacks permission
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Access denied') {
    super(ErrorCode.FORBIDDEN, message);
    this.name = 'ForbiddenError';
  }
}

/**
 * Rate Limit Error - Too many requests
 */
export class RateLimitError extends AppError {
  constructor(retryAfter?: number) {
    super(
      ErrorCode.RATE_LIMIT_EXCEEDED,
      'Too many requests. Please try again later.',
      retryAfter ? { retryAfter } : undefined
    );
    this.name = 'RateLimitError';
  }
}

/**
 * Invalid State Transition Error - Business logic violation
 */
export class InvalidStateError extends AppError {
  constructor(resource: string, currentState: string, targetState: string) {
    super(
      ErrorCode.INVALID_STATE_TRANSITION,
      `Cannot transition ${resource} from ${currentState} to ${targetState}`,
      { resource, currentState, targetState }
    );
    this.name = 'InvalidStateError';
  }
}

/**
 * API Error Response interface
 */
export interface ApiErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
}

/**
 * Create a standardized error response for API routes
 */
export function createErrorResponse(error: unknown): NextResponse<ApiErrorResponse> {
  // Handle AppError instances
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      { status: error.status }
    );
  }

  // Handle standard Error instances - map known error messages
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes('not found')) {
      return NextResponse.json(
        {
          error: {
            code: ErrorCode.NOT_FOUND,
            message: 'Resource not found',
          },
        },
        { status: 404 }
      );
    }

    if (message.includes('cannot transition')) {
      return NextResponse.json(
        {
          error: {
            code: ErrorCode.INVALID_STATE_TRANSITION,
            message: 'Invalid status transition',
          },
        },
        { status: 400 }
      );
    }

    if (message.includes('only canceled') || message.includes('only closed')) {
      return NextResponse.json(
        {
          error: {
            code: ErrorCode.INVALID_STATE_TRANSITION,
            message: error.message,
          },
        },
        { status: 400 }
      );
    }
  }

  // Default to internal server error - don't expose internal details
  return NextResponse.json(
    {
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'An unexpected error occurred',
      },
    },
    { status: 500 }
  );
}

/**
 * Type guard to check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Wrap an async handler with error handling
 */
export function withErrorHandler<T>(
  handler: () => Promise<T>,
  context: string
): Promise<T | NextResponse<ApiErrorResponse>> {
  return handler().catch((error) => {
    console.error(`Error in ${context}:`, error);
    return createErrorResponse(error);
  });
}
