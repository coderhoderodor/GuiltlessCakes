-- Migration: Create atomic order creation function
--
-- This stored procedure creates an order and its items atomically.
-- If any part fails, the entire transaction is rolled back.
--
-- To apply this migration:
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to SQL Editor
-- 3. Paste this SQL and run it

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS create_order_with_items(jsonb, jsonb[]);

/**
 * Create an order with its items atomically.
 *
 * @param p_order_data - JSONB containing order fields:
 *   - user_id: UUID
 *   - pickup_date: DATE
 *   - pickup_window_id: UUID
 *   - subtotal_amount: NUMERIC
 *   - service_fee_amount: NUMERIC
 *   - tax_amount: NUMERIC
 *   - total_amount: NUMERIC
 *   - stripe_session_id: TEXT (optional)
 *   - notes: TEXT (optional)
 *
 * @param p_items - Array of JSONB containing item fields:
 *   - menu_item_id: UUID
 *   - quantity: INTEGER
 *   - unit_price: NUMERIC
 *   - line_total: NUMERIC
 *
 * @returns UUID - The created order ID
 *
 * @example
 * SELECT create_order_with_items(
 *   '{"user_id": "...", "pickup_date": "2024-12-06", ...}'::jsonb,
 *   ARRAY['{"menu_item_id": "...", "quantity": 2, ...}'::jsonb]
 * );
 */
CREATE OR REPLACE FUNCTION create_order_with_items(
  p_order_data jsonb,
  p_items jsonb[]
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id uuid;
  v_item jsonb;
BEGIN
  -- Insert the order
  INSERT INTO orders (
    user_id,
    pickup_date,
    pickup_window_id,
    status,
    subtotal_amount,
    service_fee_amount,
    tax_amount,
    total_amount,
    stripe_session_id,
    notes
  )
  VALUES (
    (p_order_data->>'user_id')::uuid,
    (p_order_data->>'pickup_date')::date,
    (p_order_data->>'pickup_window_id')::uuid,
    'paid',
    (p_order_data->>'subtotal_amount')::numeric,
    (p_order_data->>'service_fee_amount')::numeric,
    (p_order_data->>'tax_amount')::numeric,
    (p_order_data->>'total_amount')::numeric,
    p_order_data->>'stripe_session_id',
    p_order_data->>'notes'
  )
  RETURNING id INTO v_order_id;

  -- Insert all order items
  FOREACH v_item IN ARRAY p_items
  LOOP
    INSERT INTO order_items (
      order_id,
      menu_item_id,
      quantity,
      unit_price,
      line_total
    )
    VALUES (
      v_order_id,
      (v_item->>'menu_item_id')::uuid,
      (v_item->>'quantity')::integer,
      (v_item->>'unit_price')::numeric,
      (v_item->>'line_total')::numeric
    );
  END LOOP;

  RETURN v_order_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_order_with_items(jsonb, jsonb[]) TO authenticated;
GRANT EXECUTE ON FUNCTION create_order_with_items(jsonb, jsonb[]) TO service_role;

-- Add comment for documentation
COMMENT ON FUNCTION create_order_with_items IS 'Creates an order and its items atomically. Used for checkout processing.';
