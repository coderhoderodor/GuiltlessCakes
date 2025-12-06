-- Seed data for menu items to test Stripe checkout flow
-- Run this in Supabase SQL Editor

-- Temporarily disable RLS for seeding
ALTER TABLE menu_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_translations DISABLE ROW LEVEL SECURITY;
ALTER TABLE menu_schedule DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory DISABLE ROW LEVEL SECURITY;

-- Clear existing test data (optional - uncomment if needed)
-- DELETE FROM inventory;
-- DELETE FROM menu_schedule;
-- DELETE FROM menu_item_translations;
-- DELETE FROM menu_items;

-- Insert menu items
INSERT INTO menu_items (id, slug, base_price, image_url, dietary_tags, category, active) VALUES
  ('11111111-1111-1111-1111-111111111111', 'classic-vanilla-celebration-cake', 45.00, NULL, ARRAY['sugar-free'], 'cake', TRUE),
  ('22222222-2222-2222-2222-222222222222', 'chocolate-truffle-torte', 55.00, NULL, ARRAY['gluten-free'], 'cake', TRUE),
  ('33333333-3333-3333-3333-333333333333', 'lemon-berry-layer-cake', 48.00, NULL, ARRAY['sugar-free'], 'cake', TRUE),
  ('44444444-4444-4444-4444-444444444444', 'carrot-cake-cream-cheese', 46.00, NULL, ARRAY['gluten-free'], 'cake', TRUE)
ON CONFLICT (slug) DO NOTHING;

-- English translations
INSERT INTO menu_item_translations (menu_item_id, language, name, description) VALUES
  ('11111111-1111-1111-1111-111111111111', 'en', 'Classic Vanilla Celebration Cake', 'A light and fluffy vanilla sponge layered with silky vanilla buttercream. Perfect for any celebration.'),
  ('22222222-2222-2222-2222-222222222222', 'en', 'Chocolate Truffle Torte', 'Rich, decadent chocolate cake with layers of smooth chocolate ganache. A chocolate lover''s dream.'),
  ('33333333-3333-3333-3333-333333333333', 'en', 'Lemon Berry Layer Cake', 'Zesty lemon cake filled with fresh berry compote and lemon cream cheese frosting.'),
  ('44444444-4444-4444-4444-444444444444', 'en', 'Carrot Cake with Cream Cheese', 'Moist carrot cake loaded with walnuts and topped with tangy cream cheese frosting.')
ON CONFLICT (menu_item_id, language) DO NOTHING;

-- Spanish translations
INSERT INTO menu_item_translations (menu_item_id, language, name, description) VALUES
  ('11111111-1111-1111-1111-111111111111', 'es', 'Pastel Clásico de Vainilla', 'Un bizcocho de vainilla ligero y esponjoso con capas de suave crema de mantequilla. Perfecto para cualquier celebración.'),
  ('22222222-2222-2222-2222-222222222222', 'es', 'Torta de Trufa de Chocolate', 'Pastel de chocolate rico y decadente con capas de suave ganache de chocolate. El sueño de los amantes del chocolate.'),
  ('33333333-3333-3333-3333-333333333333', 'es', 'Pastel de Limón y Frutos Rojos', 'Pastel de limón con compota de frutos rojos frescos y glaseado de queso crema con limón.'),
  ('44444444-4444-4444-4444-444444444444', 'es', 'Pastel de Zanahoria con Queso Crema', 'Húmedo pastel de zanahoria con nueces y cubierto con glaseado de queso crema.')
ON CONFLICT (menu_item_id, language) DO NOTHING;

-- Portuguese translations
INSERT INTO menu_item_translations (menu_item_id, language, name, description) VALUES
  ('11111111-1111-1111-1111-111111111111', 'pt', 'Bolo Clássico de Baunilha', 'Um pão de ló de baunilha leve e fofo com camadas de buttercream sedoso. Perfeito para qualquer celebração.'),
  ('22222222-2222-2222-2222-222222222222', 'pt', 'Torta de Trufa de Chocolate', 'Bolo de chocolate rico e decadente com camadas de ganache de chocolate suave. O sonho dos amantes de chocolate.'),
  ('33333333-3333-3333-3333-333333333333', 'pt', 'Bolo de Limão com Frutas Vermelhas', 'Bolo de limão com compota de frutas frescas e cobertura de cream cheese com limão.'),
  ('44444444-4444-4444-4444-444444444444', 'pt', 'Bolo de Cenoura com Cream Cheese', 'Bolo de cenoura úmido com nozes e coberto com cobertura de cream cheese.')
ON CONFLICT (menu_item_id, language) DO NOTHING;

-- Menu schedule for next 3 Fridays
-- Calculate dynamically based on current date
INSERT INTO menu_schedule (menu_item_id, pickup_date, is_active)
SELECT
  item_id,
  pickup_date,
  TRUE
FROM (
  SELECT unnest(ARRAY[
    '11111111-1111-1111-1111-111111111111'::UUID,
    '22222222-2222-2222-2222-222222222222'::UUID,
    '33333333-3333-3333-3333-333333333333'::UUID,
    '44444444-4444-4444-4444-444444444444'::UUID
  ]) AS item_id
) items
CROSS JOIN (
  SELECT generate_series(
    -- Next Friday
    CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::INT + 7) % 7)::INT,
    -- 3 weeks out
    CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::INT + 7) % 7)::INT + 14,
    '7 days'::INTERVAL
  )::DATE AS pickup_date
) dates
ON CONFLICT (menu_item_id, pickup_date) DO NOTHING;

-- Inventory for next 3 Fridays (daily cap of 10)
INSERT INTO inventory (menu_item_id, pickup_date, daily_cap, reserved_quantity)
SELECT
  item_id,
  pickup_date,
  10,
  0
FROM (
  SELECT unnest(ARRAY[
    '11111111-1111-1111-1111-111111111111'::UUID,
    '22222222-2222-2222-2222-222222222222'::UUID,
    '33333333-3333-3333-3333-333333333333'::UUID,
    '44444444-4444-4444-4444-444444444444'::UUID
  ]) AS item_id
) items
CROSS JOIN (
  SELECT generate_series(
    -- Next Friday
    CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::INT + 7) % 7)::INT,
    -- 3 weeks out
    CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::INT + 7) % 7)::INT + 14,
    '7 days'::INTERVAL
  )::DATE AS pickup_date
) dates
ON CONFLICT (menu_item_id, pickup_date) DO NOTHING;

-- Re-enable RLS
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Verify the data
SELECT 'Menu Items' as table_name, COUNT(*) as count FROM menu_items
UNION ALL
SELECT 'Translations', COUNT(*) FROM menu_item_translations
UNION ALL
SELECT 'Schedule', COUNT(*) FROM menu_schedule
UNION ALL
SELECT 'Inventory', COUNT(*) FROM inventory;
