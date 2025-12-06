-- Fix ALL overlapping permissive policies across all tables
-- The issue: FOR ALL admin policies overlap with specific action policies

-- ============================================
-- PROFILES
-- ============================================
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

CREATE POLICY "Users and admins can view profiles" ON profiles
  FOR SELECT USING (
    (select auth.uid()) = id
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = (select auth.uid()) AND p.is_admin = TRUE)
  );

-- ============================================
-- MENU_ITEMS
-- ============================================
DROP POLICY IF EXISTS "Anyone can view active menu items" ON menu_items;
DROP POLICY IF EXISTS "Admins can manage menu items" ON menu_items;

-- Single SELECT policy (anyone can view active, admins can view all)
CREATE POLICY "View menu items" ON menu_items
  FOR SELECT USING (
    active = TRUE
    OR EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

-- Admin-only for modifications
CREATE POLICY "Admins can insert menu items" ON menu_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

CREATE POLICY "Admins can update menu items" ON menu_items
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

CREATE POLICY "Admins can delete menu items" ON menu_items
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

-- ============================================
-- MENU_ITEM_TRANSLATIONS
-- ============================================
DROP POLICY IF EXISTS "Anyone can view translations" ON menu_item_translations;
DROP POLICY IF EXISTS "Admins can manage translations" ON menu_item_translations;

CREATE POLICY "Anyone can view translations" ON menu_item_translations
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert translations" ON menu_item_translations
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

CREATE POLICY "Admins can update translations" ON menu_item_translations
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

CREATE POLICY "Admins can delete translations" ON menu_item_translations
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

-- ============================================
-- MENU_SCHEDULE
-- ============================================
DROP POLICY IF EXISTS "Anyone can view menu schedule" ON menu_schedule;
DROP POLICY IF EXISTS "Admins can manage menu schedule" ON menu_schedule;

CREATE POLICY "Anyone can view menu schedule" ON menu_schedule
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert menu schedule" ON menu_schedule
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

CREATE POLICY "Admins can update menu schedule" ON menu_schedule
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

CREATE POLICY "Admins can delete menu schedule" ON menu_schedule
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

-- ============================================
-- INVENTORY
-- ============================================
DROP POLICY IF EXISTS "Anyone can view inventory" ON inventory;
DROP POLICY IF EXISTS "Admins can manage inventory" ON inventory;

CREATE POLICY "Anyone can view inventory" ON inventory
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert inventory" ON inventory
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

CREATE POLICY "Admins can update inventory" ON inventory
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

CREATE POLICY "Admins can delete inventory" ON inventory
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

-- ============================================
-- PICKUP_WINDOWS
-- ============================================
DROP POLICY IF EXISTS "Anyone can view pickup windows" ON pickup_windows;
DROP POLICY IF EXISTS "Admins can manage pickup windows" ON pickup_windows;

CREATE POLICY "Anyone can view pickup windows" ON pickup_windows
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert pickup windows" ON pickup_windows
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

CREATE POLICY "Admins can update pickup windows" ON pickup_windows
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

CREATE POLICY "Admins can delete pickup windows" ON pickup_windows
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

-- ============================================
-- ORDERS
-- ============================================
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON orders;

CREATE POLICY "Users and admins can view orders" ON orders
  FOR SELECT USING (
    (select auth.uid()) = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

CREATE POLICY "Users and admins can insert orders" ON orders
  FOR INSERT WITH CHECK (
    (select auth.uid()) = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

CREATE POLICY "Users and admins can update orders" ON orders
  FOR UPDATE USING (
    (select auth.uid()) = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

CREATE POLICY "Admins can delete orders" ON orders
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

-- ============================================
-- ORDER_ITEMS
-- ============================================
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Users can create own order items" ON order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;

CREATE POLICY "Users and admins can view order items" ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = (select auth.uid()))
    OR EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

CREATE POLICY "Users can insert order items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = (select auth.uid()))
  );

-- ============================================
-- INQUIRIES
-- ============================================
DROP POLICY IF EXISTS "Users can view own inquiries" ON inquiries;
DROP POLICY IF EXISTS "Users can create own inquiries" ON inquiries;
DROP POLICY IF EXISTS "Users can update own inquiries" ON inquiries;
DROP POLICY IF EXISTS "Admins can view all inquiries" ON inquiries;
DROP POLICY IF EXISTS "Admins can manage all inquiries" ON inquiries;
DROP POLICY IF EXISTS "Users and admins can view inquiries" ON inquiries;
DROP POLICY IF EXISTS "Users and admins can update inquiries" ON inquiries;
DROP POLICY IF EXISTS "Admins can update all inquiries" ON inquiries;
DROP POLICY IF EXISTS "Admins can delete all inquiries" ON inquiries;
DROP POLICY IF EXISTS "Admins can delete inquiries" ON inquiries;

CREATE POLICY "Users and admins can view inquiries" ON inquiries
  FOR SELECT USING (
    (select auth.uid()) = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

CREATE POLICY "Users can create inquiries" ON inquiries
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users and admins can update inquiries" ON inquiries
  FOR UPDATE USING (
    (select auth.uid()) = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

CREATE POLICY "Admins can delete inquiries" ON inquiries
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

-- ============================================
-- INQUIRY_IMAGES
-- ============================================
DROP POLICY IF EXISTS "Users can view own inquiry images" ON inquiry_images;
DROP POLICY IF EXISTS "Users can create own inquiry images" ON inquiry_images;
DROP POLICY IF EXISTS "Admins can view all inquiry images" ON inquiry_images;

CREATE POLICY "Users and admins can view inquiry images" ON inquiry_images
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM inquiries WHERE inquiries.id = inquiry_images.inquiry_id AND inquiries.user_id = (select auth.uid()))
    OR EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

CREATE POLICY "Users can insert inquiry images" ON inquiry_images
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM inquiries WHERE inquiries.id = inquiry_images.inquiry_id AND inquiries.user_id = (select auth.uid()))
  );

-- ============================================
-- QUOTES
-- ============================================
DROP POLICY IF EXISTS "Users can view quotes for own inquiries" ON quotes;
DROP POLICY IF EXISTS "Admins can manage all quotes" ON quotes;

CREATE POLICY "Users and admins can view quotes" ON quotes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM inquiries WHERE inquiries.id = quotes.inquiry_id AND inquiries.user_id = (select auth.uid()))
    OR EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

CREATE POLICY "Admins can insert quotes" ON quotes
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

CREATE POLICY "Admins can update quotes" ON quotes
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

CREATE POLICY "Admins can delete quotes" ON quotes
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

-- ============================================
-- SETTINGS
-- ============================================
DROP POLICY IF EXISTS "Anyone can view settings" ON settings;
DROP POLICY IF EXISTS "Admins can manage settings" ON settings;

CREATE POLICY "Anyone can view settings" ON settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert settings" ON settings
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

CREATE POLICY "Admins can update settings" ON settings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

CREATE POLICY "Admins can delete settings" ON settings
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

-- ============================================
-- WEEKLY_MENU_STORY
-- ============================================
DROP POLICY IF EXISTS "Anyone can view weekly menu story" ON weekly_menu_story;
DROP POLICY IF EXISTS "Admins can manage weekly menu story" ON weekly_menu_story;

CREATE POLICY "Anyone can view weekly menu story" ON weekly_menu_story
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert weekly menu story" ON weekly_menu_story
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

CREATE POLICY "Admins can update weekly menu story" ON weekly_menu_story
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

CREATE POLICY "Admins can delete weekly menu story" ON weekly_menu_story
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );
