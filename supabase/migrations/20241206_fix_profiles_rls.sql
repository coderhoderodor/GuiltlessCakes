-- Fix profiles RLS policy that has self-referential issue
-- The admin check queries profiles, which triggers the same policy check = potential hang

-- Create a security definer function to check admin status (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    FALSE
  );
$$;

-- Drop and recreate profiles policies using the function
DROP POLICY IF EXISTS "Users and admins can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

CREATE POLICY "Users and admins can view profiles" ON profiles
  FOR SELECT USING (
    (select auth.uid()) = id
    OR public.is_admin()
  );

-- Also fix other tables that have the same issue (admin check queries profiles)
-- MENU_ITEMS
DROP POLICY IF EXISTS "View menu items" ON menu_items;
DROP POLICY IF EXISTS "Admins can insert menu items" ON menu_items;
DROP POLICY IF EXISTS "Admins can update menu items" ON menu_items;
DROP POLICY IF EXISTS "Admins can delete menu items" ON menu_items;

CREATE POLICY "View menu items" ON menu_items
  FOR SELECT USING (active = TRUE OR public.is_admin());

CREATE POLICY "Admins can insert menu items" ON menu_items
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update menu items" ON menu_items
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete menu items" ON menu_items
  FOR DELETE USING (public.is_admin());

-- MENU_ITEM_TRANSLATIONS
DROP POLICY IF EXISTS "Admins can insert translations" ON menu_item_translations;
DROP POLICY IF EXISTS "Admins can update translations" ON menu_item_translations;
DROP POLICY IF EXISTS "Admins can delete translations" ON menu_item_translations;

CREATE POLICY "Admins can insert translations" ON menu_item_translations
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update translations" ON menu_item_translations
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete translations" ON menu_item_translations
  FOR DELETE USING (public.is_admin());

-- MENU_SCHEDULE
DROP POLICY IF EXISTS "Admins can insert menu schedule" ON menu_schedule;
DROP POLICY IF EXISTS "Admins can update menu schedule" ON menu_schedule;
DROP POLICY IF EXISTS "Admins can delete menu schedule" ON menu_schedule;

CREATE POLICY "Admins can insert menu schedule" ON menu_schedule
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update menu schedule" ON menu_schedule
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete menu schedule" ON menu_schedule
  FOR DELETE USING (public.is_admin());

-- INVENTORY
DROP POLICY IF EXISTS "Admins can insert inventory" ON inventory;
DROP POLICY IF EXISTS "Admins can update inventory" ON inventory;
DROP POLICY IF EXISTS "Admins can delete inventory" ON inventory;

CREATE POLICY "Admins can insert inventory" ON inventory
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update inventory" ON inventory
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete inventory" ON inventory
  FOR DELETE USING (public.is_admin());

-- PICKUP_WINDOWS
DROP POLICY IF EXISTS "Admins can insert pickup windows" ON pickup_windows;
DROP POLICY IF EXISTS "Admins can update pickup windows" ON pickup_windows;
DROP POLICY IF EXISTS "Admins can delete pickup windows" ON pickup_windows;

CREATE POLICY "Admins can insert pickup windows" ON pickup_windows
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update pickup windows" ON pickup_windows
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete pickup windows" ON pickup_windows
  FOR DELETE USING (public.is_admin());

-- ORDERS
DROP POLICY IF EXISTS "Users and admins can view orders" ON orders;
DROP POLICY IF EXISTS "Users and admins can insert orders" ON orders;
DROP POLICY IF EXISTS "Users and admins can update orders" ON orders;
DROP POLICY IF EXISTS "Admins can delete orders" ON orders;

CREATE POLICY "Users and admins can view orders" ON orders
  FOR SELECT USING ((select auth.uid()) = user_id OR public.is_admin());

CREATE POLICY "Users and admins can insert orders" ON orders
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id OR public.is_admin());

CREATE POLICY "Users and admins can update orders" ON orders
  FOR UPDATE USING ((select auth.uid()) = user_id OR public.is_admin());

CREATE POLICY "Admins can delete orders" ON orders
  FOR DELETE USING (public.is_admin());

-- ORDER_ITEMS
DROP POLICY IF EXISTS "Users and admins can view order items" ON order_items;

CREATE POLICY "Users and admins can view order items" ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = (select auth.uid()))
    OR public.is_admin()
  );

-- INQUIRIES
DROP POLICY IF EXISTS "Users and admins can view inquiries" ON inquiries;
DROP POLICY IF EXISTS "Users and admins can update inquiries" ON inquiries;
DROP POLICY IF EXISTS "Admins can delete inquiries" ON inquiries;

CREATE POLICY "Users and admins can view inquiries" ON inquiries
  FOR SELECT USING ((select auth.uid()) = user_id OR public.is_admin());

CREATE POLICY "Users and admins can update inquiries" ON inquiries
  FOR UPDATE USING ((select auth.uid()) = user_id OR public.is_admin());

CREATE POLICY "Admins can delete inquiries" ON inquiries
  FOR DELETE USING (public.is_admin());

-- INQUIRY_IMAGES
DROP POLICY IF EXISTS "Users and admins can view inquiry images" ON inquiry_images;

CREATE POLICY "Users and admins can view inquiry images" ON inquiry_images
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM inquiries WHERE inquiries.id = inquiry_images.inquiry_id AND inquiries.user_id = (select auth.uid()))
    OR public.is_admin()
  );

-- QUOTES
DROP POLICY IF EXISTS "Users and admins can view quotes" ON quotes;
DROP POLICY IF EXISTS "Admins can insert quotes" ON quotes;
DROP POLICY IF EXISTS "Admins can update quotes" ON quotes;
DROP POLICY IF EXISTS "Admins can delete quotes" ON quotes;

CREATE POLICY "Users and admins can view quotes" ON quotes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM inquiries WHERE inquiries.id = quotes.inquiry_id AND inquiries.user_id = (select auth.uid()))
    OR public.is_admin()
  );

CREATE POLICY "Admins can insert quotes" ON quotes
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update quotes" ON quotes
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete quotes" ON quotes
  FOR DELETE USING (public.is_admin());

-- SETTINGS
DROP POLICY IF EXISTS "Admins can insert settings" ON settings;
DROP POLICY IF EXISTS "Admins can update settings" ON settings;
DROP POLICY IF EXISTS "Admins can delete settings" ON settings;

CREATE POLICY "Admins can insert settings" ON settings
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update settings" ON settings
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete settings" ON settings
  FOR DELETE USING (public.is_admin());

-- WEEKLY_MENU_STORY
DROP POLICY IF EXISTS "Admins can insert weekly menu story" ON weekly_menu_story;
DROP POLICY IF EXISTS "Admins can update weekly menu story" ON weekly_menu_story;
DROP POLICY IF EXISTS "Admins can delete weekly menu story" ON weekly_menu_story;

CREATE POLICY "Admins can insert weekly menu story" ON weekly_menu_story
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update weekly menu story" ON weekly_menu_story
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete weekly menu story" ON weekly_menu_story
  FOR DELETE USING (public.is_admin());
