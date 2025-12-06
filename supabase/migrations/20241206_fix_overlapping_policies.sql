-- Fix overlapping permissive policies on inquiries table

-- Drop all existing policies we're replacing
DROP POLICY IF EXISTS "Admins can manage all inquiries" ON inquiries;
DROP POLICY IF EXISTS "Admins can view all inquiries" ON inquiries;
DROP POLICY IF EXISTS "Users can view own inquiries" ON inquiries;
DROP POLICY IF EXISTS "Admins can update all inquiries" ON inquiries;
DROP POLICY IF EXISTS "Admins can delete all inquiries" ON inquiries;
DROP POLICY IF EXISTS "Users and admins can view inquiries" ON inquiries;
DROP POLICY IF EXISTS "Users can update own inquiries" ON inquiries;
DROP POLICY IF EXISTS "Users and admins can update inquiries" ON inquiries;

-- Combine SELECT policies into one
CREATE POLICY "Users and admins can view inquiries" ON inquiries
  FOR SELECT USING (
    (select auth.uid()) = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

-- Combine UPDATE policies into one
CREATE POLICY "Users and admins can update inquiries" ON inquiries
  FOR UPDATE USING (
    (select auth.uid()) = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );

-- DELETE is admin-only
CREATE POLICY "Admins can delete inquiries" ON inquiries
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = TRUE)
  );
