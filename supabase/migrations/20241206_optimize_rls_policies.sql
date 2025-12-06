-- Optimize RLS policies by wrapping auth.uid() in subqueries
-- This prevents re-evaluation for each row, improving query performance

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

DROP POLICY IF EXISTS "Anyone can view active menu items" ON menu_items;
DROP POLICY IF EXISTS "Admins can manage menu items" ON menu_items;

DROP POLICY IF EXISTS "Admins can manage translations" ON menu_item_translations;
DROP POLICY IF EXISTS "Admins can manage menu schedule" ON menu_schedule;
DROP POLICY IF EXISTS "Admins can manage inventory" ON inventory;
DROP POLICY IF EXISTS "Admins can manage pickup windows" ON pickup_windows;

DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON orders;

DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Users can create own order items" ON order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;

DROP POLICY IF EXISTS "Users can view own inquiries" ON inquiries;
DROP POLICY IF EXISTS "Users can create own inquiries" ON inquiries;
DROP POLICY IF EXISTS "Users can update own inquiries" ON inquiries;
DROP POLICY IF EXISTS "Admins can view all inquiries" ON inquiries;
DROP POLICY IF EXISTS "Admins can manage all inquiries" ON inquiries;

DROP POLICY IF EXISTS "Users can view own inquiry images" ON inquiry_images;
DROP POLICY IF EXISTS "Users can create own inquiry images" ON inquiry_images;
DROP POLICY IF EXISTS "Admins can view all inquiry images" ON inquiry_images;

DROP POLICY IF EXISTS "Users can view quotes for own inquiries" ON quotes;
DROP POLICY IF EXISTS "Admins can manage all quotes" ON quotes;

DROP POLICY IF EXISTS "Admins can manage settings" ON settings;
DROP POLICY IF EXISTS "Admins can manage weekly menu story" ON weekly_menu_story;

-- PROFILES: Optimized policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING ((select auth.uid()) = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

-- MENU ITEMS: Optimized policies
CREATE POLICY "Anyone can view active menu items" ON menu_items
  FOR SELECT USING (active = TRUE OR EXISTS (
    SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE
  ));

CREATE POLICY "Admins can manage menu items" ON menu_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

-- MENU ITEM TRANSLATIONS: Optimized policies
CREATE POLICY "Admins can manage translations" ON menu_item_translations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

-- MENU SCHEDULE: Optimized policies
CREATE POLICY "Admins can manage menu schedule" ON menu_schedule
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

-- INVENTORY: Optimized policies
CREATE POLICY "Admins can manage inventory" ON inventory
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

-- PICKUP WINDOWS: Optimized policies
CREATE POLICY "Admins can manage pickup windows" ON pickup_windows
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

-- ORDERS: Optimized policies
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own orders" ON orders
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

CREATE POLICY "Admins can manage all orders" ON orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

-- ORDER ITEMS: Optimized policies
CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = (select auth.uid()))
  );

CREATE POLICY "Users can create own order items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = (select auth.uid()))
  );

CREATE POLICY "Admins can view all order items" ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

-- INQUIRIES: Optimized policies
CREATE POLICY "Users can view own inquiries" ON inquiries
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own inquiries" ON inquiries
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own inquiries" ON inquiries
  FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Admins can view all inquiries" ON inquiries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

CREATE POLICY "Admins can manage all inquiries" ON inquiries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

-- INQUIRY IMAGES: Optimized policies
CREATE POLICY "Users can view own inquiry images" ON inquiry_images
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM inquiries WHERE inquiries.id = inquiry_images.inquiry_id AND inquiries.user_id = (select auth.uid()))
  );

CREATE POLICY "Users can create own inquiry images" ON inquiry_images
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM inquiries WHERE inquiries.id = inquiry_images.inquiry_id AND inquiries.user_id = (select auth.uid()))
  );

CREATE POLICY "Admins can view all inquiry images" ON inquiry_images
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

-- QUOTES: Optimized policies
CREATE POLICY "Users can view quotes for own inquiries" ON quotes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM inquiries WHERE inquiries.id = quotes.inquiry_id AND inquiries.user_id = (select auth.uid()))
  );

CREATE POLICY "Admins can manage all quotes" ON quotes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

-- SETTINGS: Optimized policies
CREATE POLICY "Admins can manage settings" ON settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

-- WEEKLY MENU STORY: Optimized policies
CREATE POLICY "Admins can manage weekly menu story" ON weekly_menu_story
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );
