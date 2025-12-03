-- Guiltless Cakes Database Schema
-- For Supabase (PostgreSQL)

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUM TYPES
-- =====================================================

CREATE TYPE language AS ENUM ('en', 'es', 'pt');
CREATE TYPE order_status AS ENUM ('paid', 'prepping', 'ready', 'picked_up', 'canceled');
CREATE TYPE inquiry_status AS ENUM ('new', 'in_review', 'quoted', 'accepted', 'in_progress', 'ready_for_pickup', 'completed', 'rejected', 'closed');
CREATE TYPE quote_status AS ENUM ('draft', 'sent', 'paid', 'expired');
CREATE TYPE event_type AS ENUM ('birthday', 'wedding', 'anniversary', 'graduation', 'baby_shower', 'other');
CREATE TYPE cake_shape AS ENUM ('round', 'square', 'rectangular', 'heart', 'other');
CREATE TYPE decoration_style AS ENUM ('simple', 'semi_naked', 'floral', 'textured', 'drip', 'buttercream', 'fondant', 'other');

-- =====================================================
-- PROFILES TABLE
-- =====================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  preferred_language language DEFAULT 'en',
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, phone, preferred_language)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE((NEW.raw_user_meta_data->>'preferred_language')::language, 'en')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- MENU ITEMS TABLE
-- =====================================================

CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  base_price DECIMAL(10,2) NOT NULL CHECK (base_price >= 0),
  image_url TEXT,
  dietary_tags TEXT[] DEFAULT '{}',
  category TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- MENU ITEM TRANSLATIONS TABLE
-- =====================================================

CREATE TABLE menu_item_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  language language NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  weekly_story_snippet TEXT,
  UNIQUE(menu_item_id, language)
);

-- =====================================================
-- MENU SCHEDULE TABLE
-- =====================================================

CREATE TABLE menu_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  pickup_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(menu_item_id, pickup_date)
);

-- =====================================================
-- INVENTORY TABLE
-- =====================================================

CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  pickup_date DATE NOT NULL,
  daily_cap INTEGER NOT NULL CHECK (daily_cap >= 0),
  reserved_quantity INTEGER DEFAULT 0 CHECK (reserved_quantity >= 0),
  UNIQUE(menu_item_id, pickup_date)
);

-- =====================================================
-- PICKUP WINDOWS TABLE
-- =====================================================

CREATE TABLE pickup_windows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_capacity INTEGER NOT NULL DEFAULT 10,
  current_bookings INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE
);

-- Insert default pickup windows
INSERT INTO pickup_windows (label, start_time, end_time, max_capacity) VALUES
  ('10:00 AM - 12:00 PM', '10:00', '12:00', 10),
  ('12:00 PM - 2:00 PM', '12:00', '14:00', 10),
  ('2:00 PM - 4:00 PM', '14:00', '16:00', 10),
  ('4:00 PM - 6:00 PM', '16:00', '18:00', 10);

-- =====================================================
-- ORDERS TABLE
-- =====================================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pickup_date DATE NOT NULL,
  pickup_window_id UUID NOT NULL REFERENCES pickup_windows(id),
  status order_status DEFAULT 'paid',
  subtotal_amount DECIMAL(10,2) NOT NULL CHECK (subtotal_amount >= 0),
  service_fee_amount DECIMAL(10,2) DEFAULT 0 CHECK (service_fee_amount >= 0),
  tax_amount DECIMAL(10,2) DEFAULT 0 CHECK (tax_amount >= 0),
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  stripe_session_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- ORDER ITEMS TABLE
-- =====================================================

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  line_total DECIMAL(10,2) NOT NULL CHECK (line_total >= 0)
);

-- =====================================================
-- INQUIRIES TABLE (Custom Cakes)
-- =====================================================

CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type event_type NOT NULL,
  event_date DATE NOT NULL,
  servings INTEGER NOT NULL CHECK (servings > 0),
  tiers INTEGER NOT NULL CHECK (tiers >= 1 AND tiers <= 4),
  shape cake_shape NOT NULL,
  style decoration_style NOT NULL,
  color_palette_text TEXT,
  dietary_notes TEXT,
  notes TEXT,
  status inquiry_status DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER inquiries_updated_at
  BEFORE UPDATE ON inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- INQUIRY IMAGES TABLE
-- =====================================================

CREATE TABLE inquiry_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inquiry_id UUID NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- QUOTES TABLE
-- =====================================================

CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inquiry_id UUID NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
  deposit_amount DECIMAL(10,2) CHECK (deposit_amount >= 0),
  deposit_percentage INTEGER CHECK (deposit_percentage >= 0 AND deposit_percentage <= 100),
  payment_link_url TEXT,
  status quote_status DEFAULT 'draft',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- SETTINGS TABLE
-- =====================================================

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Insert default settings
INSERT INTO settings (key, value) VALUES
  ('service_fee_rate', '{"rate": 0.05}'::jsonb),
  ('ordering_enabled', '{"enabled": true}'::jsonb),
  ('max_weekly_orders', '{"limit": 50}'::jsonb),
  ('pickup_instructions', '{
    "en": "Please ring the doorbell when you arrive. If no answer, text us at the number provided in your confirmation email. Street parking available.",
    "es": "Por favor toque el timbre cuando llegue. Si no hay respuesta, envíenos un mensaje de texto al número proporcionado en su correo de confirmación. Estacionamiento en la calle disponible.",
    "pt": "Por favor, toque a campainha quando chegar. Se não houver resposta, envie-nos uma mensagem de texto para o número fornecido no seu e-mail de confirmação. Estacionamento na rua disponível."
  }'::jsonb),
  ('business_info', '{
    "name": "Guiltless Cakes",
    "address": "Northeast Philadelphia, PA",
    "phone": "(215) 555-0123",
    "email": "hello@guiltlesscakes.com"
  }'::jsonb),
  ('social_links', '{
    "instagram": "https://instagram.com/guiltlesscakes",
    "facebook": "https://facebook.com/guiltlesscakes"
  }'::jsonb);

-- =====================================================
-- WEEKLY MENU STORY TABLE
-- =====================================================

CREATE TABLE weekly_menu_story (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pickup_date DATE UNIQUE NOT NULL,
  story_en TEXT,
  story_es TEXT,
  story_pt TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER weekly_menu_story_updated_at
  BEFORE UPDATE ON weekly_menu_story
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickup_windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiry_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_menu_story ENABLE ROW LEVEL SECURITY;

-- PROFILES: Users can read/update own profile, admins can read all
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- MENU ITEMS: Public read, admin write
CREATE POLICY "Anyone can view active menu items" ON menu_items
  FOR SELECT USING (active = TRUE OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE
  ));

CREATE POLICY "Admins can manage menu items" ON menu_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- MENU ITEM TRANSLATIONS: Public read, admin write
CREATE POLICY "Anyone can view translations" ON menu_item_translations
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage translations" ON menu_item_translations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- MENU SCHEDULE: Public read, admin write
CREATE POLICY "Anyone can view menu schedule" ON menu_schedule
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage menu schedule" ON menu_schedule
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- INVENTORY: Public read, admin write
CREATE POLICY "Anyone can view inventory" ON inventory
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage inventory" ON inventory
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- PICKUP WINDOWS: Public read, admin write
CREATE POLICY "Anyone can view pickup windows" ON pickup_windows
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage pickup windows" ON pickup_windows
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- ORDERS: Users see own orders, admins see all
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "Admins can manage all orders" ON orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- ORDER ITEMS: Users see own, admins see all
CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

CREATE POLICY "Users can create own order items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

CREATE POLICY "Admins can view all order items" ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- INQUIRIES: Users see own, admins see all
CREATE POLICY "Users can view own inquiries" ON inquiries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own inquiries" ON inquiries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inquiries" ON inquiries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all inquiries" ON inquiries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "Admins can manage all inquiries" ON inquiries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- INQUIRY IMAGES: Users see own, admins see all
CREATE POLICY "Users can view own inquiry images" ON inquiry_images
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM inquiries WHERE inquiries.id = inquiry_images.inquiry_id AND inquiries.user_id = auth.uid())
  );

CREATE POLICY "Users can create own inquiry images" ON inquiry_images
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM inquiries WHERE inquiries.id = inquiry_images.inquiry_id AND inquiries.user_id = auth.uid())
  );

CREATE POLICY "Admins can view all inquiry images" ON inquiry_images
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- QUOTES: Users see quotes for own inquiries, admins see all
CREATE POLICY "Users can view quotes for own inquiries" ON quotes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM inquiries WHERE inquiries.id = quotes.inquiry_id AND inquiries.user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all quotes" ON quotes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- SETTINGS: Public read, admin write
CREATE POLICY "Anyone can view settings" ON settings
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage settings" ON settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- WEEKLY MENU STORY: Public read, admin write
CREATE POLICY "Anyone can view weekly menu story" ON weekly_menu_story
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage weekly menu story" ON weekly_menu_story
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_menu_schedule_pickup_date ON menu_schedule(pickup_date);
CREATE INDEX idx_menu_schedule_active ON menu_schedule(is_active);
CREATE INDEX idx_inventory_pickup_date ON inventory(pickup_date);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_pickup_date ON orders(pickup_date);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_inquiries_user_id ON inquiries(user_id);
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_event_date ON inquiries(event_date);

-- =====================================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- =====================================================

-- Function to check if ordering is still open
CREATE OR REPLACE FUNCTION is_ordering_open(target_pickup_date DATE)
RETURNS BOOLEAN AS $$
DECLARE
  cutoff_time TIMESTAMPTZ;
  ordering_enabled BOOLEAN;
BEGIN
  -- Check if ordering is globally enabled
  SELECT (value->>'enabled')::BOOLEAN INTO ordering_enabled
  FROM settings WHERE key = 'ordering_enabled';

  IF NOT COALESCE(ordering_enabled, TRUE) THEN
    RETURN FALSE;
  END IF;

  -- Calculate cutoff (Wednesday 11:59 PM before Friday pickup)
  cutoff_time := (target_pickup_date - INTERVAL '2 days')::DATE + TIME '23:59:59';

  RETURN NOW() < cutoff_time;
END;
$$ LANGUAGE plpgsql;

-- Function to get available quantity for a menu item
CREATE OR REPLACE FUNCTION get_available_quantity(p_menu_item_id UUID, p_pickup_date DATE)
RETURNS INTEGER AS $$
DECLARE
  cap INTEGER;
  reserved INTEGER;
BEGIN
  SELECT daily_cap, reserved_quantity INTO cap, reserved
  FROM inventory
  WHERE menu_item_id = p_menu_item_id AND pickup_date = p_pickup_date;

  IF cap IS NULL THEN
    RETURN 0;
  END IF;

  RETURN GREATEST(0, cap - COALESCE(reserved, 0));
END;
$$ LANGUAGE plpgsql;

-- Function to reserve inventory (called when order is placed)
CREATE OR REPLACE FUNCTION reserve_inventory(p_menu_item_id UUID, p_pickup_date DATE, p_quantity INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  available INTEGER;
BEGIN
  available := get_available_quantity(p_menu_item_id, p_pickup_date);

  IF available < p_quantity THEN
    RETURN FALSE;
  END IF;

  UPDATE inventory
  SET reserved_quantity = reserved_quantity + p_quantity
  WHERE menu_item_id = p_menu_item_id AND pickup_date = p_pickup_date;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to release inventory (called when order is canceled)
CREATE OR REPLACE FUNCTION release_inventory(p_menu_item_id UUID, p_pickup_date DATE, p_quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE inventory
  SET reserved_quantity = GREATEST(0, reserved_quantity - p_quantity)
  WHERE menu_item_id = p_menu_item_id AND pickup_date = p_pickup_date;
END;
$$ LANGUAGE plpgsql;
