import { describe, it, expect } from 'vitest';
import {
  createMenuItemSchema,
  updateMenuItemSchema,
  createOrderSchema,
  checkoutRequestSchema,
  orderStatusSchema,
  inquiryStatusSchema,
} from '@/lib/validation/schemas';
import { validate } from '@/lib/validation';

describe('Validation Schemas', () => {
  describe('createMenuItemSchema', () => {
    it('should accept valid menu item data', () => {
      const validData = {
        slug: 'chocolate-cake',
        base_price: 29.99,
        translations: [
          {
            language: 'en',
            name: 'Chocolate Cake',
            description: 'A delicious chocolate cake',
          },
        ],
      };

      const result = validate(createMenuItemSchema, validData);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should reject invalid slug format', () => {
      const invalidData = {
        slug: 'Invalid Slug With Spaces',
        base_price: 29.99,
        translations: [
          {
            language: 'en',
            name: 'Test',
            description: 'Test description',
          },
        ],
      };

      const result = validate(createMenuItemSchema, invalidData);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should reject negative price', () => {
      const invalidData = {
        slug: 'test-cake',
        base_price: -10,
        translations: [
          {
            language: 'en',
            name: 'Test',
            description: 'Test description',
          },
        ],
      };

      const result = validate(createMenuItemSchema, invalidData);
      expect(result.success).toBe(false);
    });

    it('should require at least one translation', () => {
      const invalidData = {
        slug: 'test-cake',
        base_price: 29.99,
        translations: [],
      };

      const result = validate(createMenuItemSchema, invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('checkoutRequestSchema', () => {
    it('should accept valid checkout data', () => {
      const validData = {
        items: [
          {
            menuItemId: '123e4567-e89b-12d3-a456-426614174000',
            quantity: 2,
            name: 'Chocolate Cake',
          },
        ],
        pickupDate: '2024-12-20',
        pickupWindowId: '123e4567-e89b-12d3-a456-426614174001',
      };

      const result = validate(checkoutRequestSchema, validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty items array', () => {
      const invalidData = {
        items: [],
        pickupDate: '2024-12-20',
        pickupWindowId: '123e4567-e89b-12d3-a456-426614174001',
      };

      const result = validate(checkoutRequestSchema, invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid date format', () => {
      const invalidData = {
        items: [
          {
            menuItemId: '123e4567-e89b-12d3-a456-426614174000',
            quantity: 2,
            name: 'Chocolate Cake',
          },
        ],
        pickupDate: '12-20-2024', // Wrong format
        pickupWindowId: '123e4567-e89b-12d3-a456-426614174001',
      };

      const result = validate(checkoutRequestSchema, invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject quantity exceeding max', () => {
      const invalidData = {
        items: [
          {
            menuItemId: '123e4567-e89b-12d3-a456-426614174000',
            quantity: 15, // Max is 10
            name: 'Chocolate Cake',
          },
        ],
        pickupDate: '2024-12-20',
        pickupWindowId: '123e4567-e89b-12d3-a456-426614174001',
      };

      const result = validate(checkoutRequestSchema, invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('orderStatusSchema', () => {
    it('should accept valid order statuses', () => {
      const validStatuses = ['paid', 'prepping', 'ready', 'picked_up', 'canceled'];

      validStatuses.forEach((status) => {
        const result = orderStatusSchema.safeParse(status);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid order status', () => {
      const result = orderStatusSchema.safeParse('invalid_status');
      expect(result.success).toBe(false);
    });
  });

  describe('inquiryStatusSchema', () => {
    it('should accept valid inquiry statuses', () => {
      const validStatuses = [
        'new',
        'in_review',
        'quoted',
        'accepted',
        'in_progress',
        'ready_for_pickup',
        'completed',
        'rejected',
        'closed',
      ];

      validStatuses.forEach((status) => {
        const result = inquiryStatusSchema.safeParse(status);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid inquiry status', () => {
      const result = inquiryStatusSchema.safeParse('pending');
      expect(result.success).toBe(false);
    });
  });
});
