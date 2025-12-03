/**
 * Validation Schemas - Single Responsibility Principle
 *
 * All validation logic is centralized here, separate from business logic.
 * Using Zod for runtime type validation and type inference.
 */

import { z } from 'zod';

// ============================================
// Common Schemas
// ============================================
export const languageSchema = z.enum(['en', 'es', 'pt']);
export const orderStatusSchema = z.enum(['paid', 'prepping', 'ready', 'picked_up', 'canceled']);
export const inquiryStatusSchema = z.enum([
  'new',
  'in_review',
  'quoted',
  'accepted',
  'in_progress',
  'ready_for_pickup',
  'completed',
  'rejected',
  'closed',
]);
export const quoteStatusSchema = z.enum(['draft', 'sent', 'paid', 'expired']);
export const eventTypeSchema = z.enum(['birthday', 'wedding', 'anniversary', 'graduation', 'baby_shower', 'other']);
export const cakeShapeSchema = z.enum(['round', 'square', 'rectangular', 'heart', 'other']);
export const decorationStyleSchema = z.enum([
  'simple',
  'semi_naked',
  'floral',
  'textured',
  'drip',
  'buttercream',
  'fondant',
  'other',
]);

const uuidSchema = z.string().uuid();
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)');
const timeSchema = z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Invalid time format (HH:MM or HH:MM:SS)');
const phoneSchema = z.string().min(10).max(20).optional();
const emailSchema = z.string().email();
const urlSchema = z.string().url().optional().nullable();
const positiveNumber = z.number().positive();
const nonNegativeNumber = z.number().nonnegative();
const positiveInt = z.number().int().positive();
const nonNegativeInt = z.number().int().nonnegative();

// ============================================
// Menu Item Schemas
// ============================================
export const menuItemTranslationSchema = z.object({
  language: languageSchema,
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  weekly_story_snippet: z.string().max(200).optional().nullable(),
});

export const createMenuItemSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  base_price: positiveNumber,
  image_url: urlSchema,
  dietary_tags: z.array(z.string()).default([]),
  category: z.string().max(50).optional().nullable(),
  active: z.boolean().default(true),
  translations: z.array(menuItemTranslationSchema).min(1),
});

export const updateMenuItemSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  base_price: positiveNumber.optional(),
  image_url: urlSchema,
  dietary_tags: z.array(z.string()).optional(),
  category: z.string().max(50).optional().nullable(),
  active: z.boolean().optional(),
});

// ============================================
// Menu Schedule Schemas
// ============================================
export const createMenuScheduleSchema = z.object({
  menu_item_id: uuidSchema,
  pickup_date: dateSchema,
  is_active: z.boolean().default(true),
});

export const updateMenuScheduleSchema = z.object({
  is_active: z.boolean().optional(),
});

// ============================================
// Inventory Schemas
// ============================================
export const createInventorySchema = z.object({
  menu_item_id: uuidSchema,
  pickup_date: dateSchema,
  daily_cap: positiveInt,
  reserved_quantity: nonNegativeInt.default(0),
});

export const updateInventorySchema = z.object({
  daily_cap: positiveInt.optional(),
  reserved_quantity: nonNegativeInt.optional(),
});

// ============================================
// Order Schemas
// ============================================
export const orderItemSchema = z.object({
  menu_item_id: uuidSchema,
  quantity: positiveInt,
  unit_price: positiveNumber,
  line_total: positiveNumber,
});

export const createOrderSchema = z.object({
  user_id: uuidSchema,
  pickup_date: dateSchema,
  pickup_window_id: uuidSchema,
  subtotal_amount: nonNegativeNumber,
  service_fee_amount: nonNegativeNumber,
  tax_amount: nonNegativeNumber,
  total_amount: positiveNumber,
  stripe_session_id: z.string().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  items: z.array(orderItemSchema).min(1),
});

export const updateOrderSchema = z.object({
  status: orderStatusSchema.optional(),
  notes: z.string().max(500).optional().nullable(),
});

// ============================================
// Inquiry Schemas
// ============================================
export const createInquirySchema = z.object({
  user_id: uuidSchema,
  event_type: eventTypeSchema,
  event_date: dateSchema,
  servings: positiveInt.min(10).max(500),
  tiers: positiveInt.min(1).max(5),
  shape: cakeShapeSchema,
  style: decorationStyleSchema,
  color_palette_text: z.string().max(200).optional().nullable(),
  dietary_notes: z.string().max(500).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  image_urls: z.array(z.string().url()).max(5).optional(),
});

export const updateInquirySchema = z.object({
  status: inquiryStatusSchema.optional(),
  notes: z.string().max(1000).optional().nullable(),
});

// ============================================
// Quote Schemas
// ============================================
export const createQuoteSchema = z.object({
  inquiry_id: uuidSchema,
  total_price: positiveNumber,
  deposit_amount: positiveNumber.optional().nullable(),
  deposit_percentage: z.number().min(0).max(100).optional().nullable(),
  expires_at: z.string().datetime().optional().nullable(),
});

export const updateQuoteSchema = z.object({
  total_price: positiveNumber.optional(),
  deposit_amount: positiveNumber.optional().nullable(),
  payment_link_url: urlSchema,
  status: quoteStatusSchema.optional(),
  expires_at: z.string().datetime().optional().nullable(),
});

// ============================================
// Pickup Window Schemas
// ============================================
export const createPickupWindowSchema = z.object({
  label: z.string().min(1).max(100),
  start_time: timeSchema,
  end_time: timeSchema,
  max_capacity: positiveInt,
  active: z.boolean().default(true),
});

export const updatePickupWindowSchema = z.object({
  label: z.string().min(1).max(100).optional(),
  start_time: timeSchema.optional(),
  end_time: timeSchema.optional(),
  max_capacity: positiveInt.optional(),
  current_bookings: nonNegativeInt.optional(),
  active: z.boolean().optional(),
});

// ============================================
// Profile Schemas
// ============================================
export const createProfileSchema = z.object({
  id: uuidSchema,
  first_name: z.string().min(1).max(50),
  last_name: z.string().min(1).max(50),
  phone: phoneSchema,
  preferred_language: languageSchema.default('en'),
});

export const updateProfileSchema = z.object({
  first_name: z.string().min(1).max(50).optional(),
  last_name: z.string().min(1).max(50).optional(),
  phone: phoneSchema,
  preferred_language: languageSchema.optional(),
});

// ============================================
// Settings Schemas
// ============================================
export const serviceFeeSettingSchema = z.object({
  rate: z.number().min(0).max(0.25),
});

export const orderingEnabledSettingSchema = z.object({
  enabled: z.boolean(),
});

export const maxWeeklyOrdersSettingSchema = z.object({
  limit: positiveInt,
});

export const pickupInstructionsSettingSchema = z.object({
  en: z.string().max(500),
  es: z.string().max(500),
  pt: z.string().max(500),
});

export const businessInfoSettingSchema = z.object({
  name: z.string().max(100),
  address: z.string().max(200),
  phone: z.string().max(20),
  email: emailSchema,
});

// ============================================
// Checkout Schemas
// ============================================
export const checkoutItemSchema = z.object({
  menuItemId: z.string().uuid(),
  quantity: z.number().int().positive().max(10),
  name: z.string().min(1).max(100),
});

export const checkoutRequestSchema = z.object({
  items: z.array(checkoutItemSchema).min(1).max(20),
  pickupDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  pickupWindowId: z.string().uuid(),
});

// ============================================
// Type Exports
// ============================================
export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;
export type CreateMenuScheduleInput = z.infer<typeof createMenuScheduleSchema>;
export type UpdateMenuScheduleInput = z.infer<typeof updateMenuScheduleSchema>;
export type CreateInventoryInput = z.infer<typeof createInventorySchema>;
export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type CreateInquiryInput = z.infer<typeof createInquirySchema>;
export type UpdateInquiryInput = z.infer<typeof updateInquirySchema>;
export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
export type UpdateQuoteInput = z.infer<typeof updateQuoteSchema>;
export type CreatePickupWindowInput = z.infer<typeof createPickupWindowSchema>;
export type UpdatePickupWindowInput = z.infer<typeof updatePickupWindowSchema>;
export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CheckoutRequestInput = z.infer<typeof checkoutRequestSchema>;
