import { describe, it, expect } from 'vitest';
import {
  AppError,
  NotFoundError,
  ValidationError,
  AuthError,
  ForbiddenError,
  RateLimitError,
  InvalidStateError,
  ErrorCode,
  createErrorResponse,
  isAppError,
} from '@/lib/errors';

describe('Error Types', () => {
  describe('AppError', () => {
    it('should create an error with correct properties', () => {
      const error = new AppError(ErrorCode.INTERNAL_ERROR, 'Something went wrong');

      expect(error.code).toBe(ErrorCode.INTERNAL_ERROR);
      expect(error.message).toBe('Something went wrong');
      expect(error.status).toBe(500);
      expect(error.name).toBe('AppError');
    });

    it('should include details when provided', () => {
      const details = { field: 'email', reason: 'invalid' };
      const error = new AppError(ErrorCode.VALIDATION_ERROR, 'Validation failed', details);

      expect(error.details).toEqual(details);
    });
  });

  describe('NotFoundError', () => {
    it('should create error with resource name', () => {
      const error = new NotFoundError('Order');

      expect(error.code).toBe(ErrorCode.NOT_FOUND);
      expect(error.status).toBe(404);
      expect(error.message).toBe('Order not found');
    });

    it('should include ID when provided', () => {
      const error = new NotFoundError('Order', '12345');

      expect(error.message).toBe('Order with ID 12345 not found');
      expect(error.details).toEqual({ resource: 'Order', id: '12345' });
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with field errors', () => {
      const errors = [
        { field: 'email', message: 'Invalid email format' },
        { field: 'password', message: 'Password too short' },
      ];
      const error = new ValidationError('Invalid input', errors);

      expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(error.status).toBe(400);
      expect(error.details).toEqual({ errors });
    });
  });

  describe('AuthError', () => {
    it('should create auth error with default message', () => {
      const error = new AuthError();

      expect(error.code).toBe(ErrorCode.UNAUTHORIZED);
      expect(error.status).toBe(401);
      expect(error.message).toBe('Authentication required');
    });

    it('should allow custom message', () => {
      const error = new AuthError('Session expired');

      expect(error.message).toBe('Session expired');
    });
  });

  describe('ForbiddenError', () => {
    it('should create forbidden error', () => {
      const error = new ForbiddenError();

      expect(error.code).toBe(ErrorCode.FORBIDDEN);
      expect(error.status).toBe(403);
      expect(error.message).toBe('Access denied');
    });
  });

  describe('RateLimitError', () => {
    it('should create rate limit error', () => {
      const error = new RateLimitError(60);

      expect(error.code).toBe(ErrorCode.RATE_LIMIT_EXCEEDED);
      expect(error.status).toBe(429);
      expect(error.details).toEqual({ retryAfter: 60 });
    });
  });

  describe('InvalidStateError', () => {
    it('should create state transition error', () => {
      const error = new InvalidStateError('order', 'paid', 'picked_up');

      expect(error.code).toBe(ErrorCode.INVALID_STATE_TRANSITION);
      expect(error.status).toBe(400);
      expect(error.message).toBe('Cannot transition order from paid to picked_up');
    });
  });

  describe('isAppError', () => {
    it('should return true for AppError instances', () => {
      const error = new NotFoundError('Order');
      expect(isAppError(error)).toBe(true);
    });

    it('should return false for regular Error', () => {
      const error = new Error('Regular error');
      expect(isAppError(error)).toBe(false);
    });
  });

  describe('createErrorResponse', () => {
    it('should create response for AppError', async () => {
      const error = new NotFoundError('Order', '123');
      const response = createErrorResponse(error);

      expect(response.status).toBe(404);

      const body = await response.json();
      expect(body.error.code).toBe(ErrorCode.NOT_FOUND);
      expect(body.error.message).toBe('Order with ID 123 not found');
    });

    it('should handle regular Error with "not found" message', async () => {
      const error = new Error('Order not found');
      const response = createErrorResponse(error);

      expect(response.status).toBe(404);

      const body = await response.json();
      expect(body.error.code).toBe(ErrorCode.NOT_FOUND);
    });

    it('should handle unknown errors as internal error', async () => {
      const error = new Error('Something unexpected');
      const response = createErrorResponse(error);

      expect(response.status).toBe(500);

      const body = await response.json();
      expect(body.error.code).toBe(ErrorCode.INTERNAL_ERROR);
      expect(body.error.message).toBe('An unexpected error occurred');
    });
  });
});
