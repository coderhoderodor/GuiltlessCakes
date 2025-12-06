-- Migration: Convert Pickup to Delivery System
-- Date: 2024-12-06
-- Description: Transform pickup-only system to delivery-only with address support

-- ============================================================================
-- PHASE 1: Add Delivery Address Fields to Profiles
-- ============================================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS delivery_address_line1 TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS delivery_address_line2 TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS delivery_city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS delivery_state TEXT DEFAULT 'PA';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS delivery_zip TEXT;

-- ============================================================================
-- PHASE 2: Update Orders Table - Rename pickup to delivery & add address
-- ============================================================================

-- Rename pickup fields to delivery
ALTER TABLE orders RENAME COLUMN pickup_date TO delivery_date;
ALTER TABLE orders RENAME COLUMN pickup_window_id TO delivery_window_id;

-- Add delivery address fields (snapshot at order time)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address_line1 TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address_line2 TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_city TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_state TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_zip TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_fee DECIMAL(10,2) DEFAULT 0;

-- ============================================================================
-- PHASE 3: Rename pickup_windows to delivery_windows
-- ============================================================================

ALTER TABLE pickup_windows RENAME TO delivery_windows;

-- Update foreign key constraint name (if exists)
-- Note: This may need manual adjustment based on actual constraint names
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_pickup_window_id_fkey;
ALTER TABLE orders ADD CONSTRAINT orders_delivery_window_id_fkey
  FOREIGN KEY (delivery_window_id) REFERENCES delivery_windows(id);

-- ============================================================================
-- PHASE 4: Update Order Status Enum
-- ============================================================================

-- Add 'out_for_delivery' status
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'out_for_delivery';

-- Rename 'picked_up' to 'delivered' (PostgreSQL 10+)
ALTER TYPE order_status RENAME VALUE 'picked_up' TO 'delivered';

-- ============================================================================
-- PHASE 5: Update menu_schedule and inventory tables
-- ============================================================================

-- Rename pickup_date to delivery_date in menu_schedule
ALTER TABLE menu_schedule RENAME COLUMN pickup_date TO delivery_date;

-- Rename pickup_date to delivery_date in inventory
ALTER TABLE inventory RENAME COLUMN pickup_date TO delivery_date;

-- ============================================================================
-- PHASE 6: Update Inquiry Status Enum (ready_for_pickup -> ready_for_delivery)
-- ============================================================================

ALTER TYPE inquiry_status RENAME VALUE 'ready_for_pickup' TO 'ready_for_delivery';

-- ============================================================================
-- Comments for documentation
-- ============================================================================

COMMENT ON COLUMN profiles.delivery_address_line1 IS 'Primary street address for delivery';
COMMENT ON COLUMN profiles.delivery_address_line2 IS 'Apartment, suite, unit number, etc.';
COMMENT ON COLUMN profiles.delivery_city IS 'City for delivery address';
COMMENT ON COLUMN profiles.delivery_state IS 'State for delivery address (default PA)';
COMMENT ON COLUMN profiles.delivery_zip IS 'ZIP code for delivery - validated against service area';

COMMENT ON COLUMN orders.delivery_fee IS 'Delivery fee applied to order ($8 for orders under $50, free for $50+)';
COMMENT ON COLUMN orders.delivery_address_line1 IS 'Snapshot of delivery address at order time';
