// Database types for Guiltless Cakes

export type Language = 'en' | 'es' | 'pt';

export type OrderStatus = 'paid' | 'prepping' | 'ready' | 'picked_up' | 'canceled';

export type InquiryStatus = 'new' | 'in_review' | 'quoted' | 'accepted' | 'in_progress' | 'ready_for_pickup' | 'completed' | 'rejected' | 'closed';

export type QuoteStatus = 'draft' | 'sent' | 'paid' | 'expired';

export type EventType = 'birthday' | 'wedding' | 'anniversary' | 'graduation' | 'baby_shower' | 'other';

export type CakeShape = 'round' | 'square' | 'rectangular' | 'heart' | 'other';

export type DecorationStyle = 'simple' | 'semi_naked' | 'floral' | 'textured' | 'drip' | 'buttercream' | 'fondant' | 'other';

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  preferred_language: Language;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  slug: string;
  base_price: number;
  image_url: string | null;
  dietary_tags: string[];
  category: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  translations?: MenuItemTranslation[];
}

export interface MenuItemTranslation {
  id: string;
  menu_item_id: string;
  language: Language;
  name: string;
  description: string;
  weekly_story_snippet: string | null;
}

export interface MenuSchedule {
  id: string;
  menu_item_id: string;
  pickup_date: string;
  is_active: boolean;
  created_at: string;
  menu_item?: MenuItem;
}

export interface Inventory {
  id: string;
  menu_item_id: string;
  pickup_date: string;
  daily_cap: number;
  reserved_quantity: number;
}

export interface PickupWindow {
  id: string;
  label: string;
  start_time: string;
  end_time: string;
  max_capacity: number;
  current_bookings: number;
  active: boolean;
}

export interface Order {
  id: string;
  user_id: string;
  pickup_date: string;
  pickup_window_id: string;
  status: OrderStatus;
  subtotal_amount: number;
  service_fee_amount: number;
  tax_amount: number;
  total_amount: number;
  stripe_session_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  pickup_window?: PickupWindow;
  order_items?: OrderItem[];
  profile?: Profile;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  menu_item?: MenuItem;
}

export interface Inquiry {
  id: string;
  user_id: string;
  event_type: EventType;
  event_date: string;
  servings: number;
  tiers: number;
  shape: CakeShape;
  style: DecorationStyle;
  color_palette_text: string | null;
  dietary_notes: string | null;
  notes: string | null;
  status: InquiryStatus;
  created_at: string;
  updated_at: string;
  images?: InquiryImage[];
  quotes?: Quote[];
  profile?: Profile;
}

export interface InquiryImage {
  id: string;
  inquiry_id: string;
  image_url: string;
  created_at: string;
}

export interface Quote {
  id: string;
  inquiry_id: string;
  total_price: number;
  deposit_amount: number | null;
  deposit_percentage: number | null;
  payment_link_url: string | null;
  status: QuoteStatus;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Settings {
  key: string;
  value: Record<string, unknown>;
}

// Cart types
export interface CartItem {
  menuItemId: string;
  quantity: number;
  unitPrice: number;
  name: string;
  imageUrl: string | null;
}

export interface Cart {
  items: CartItem[];
  pickupDate: string | null;
  pickupWindowId: string | null;
}

// Form types
export interface InquiryFormData {
  event_type: EventType;
  event_date: string;
  servings: number;
  tiers: number;
  shape: CakeShape;
  style: DecorationStyle;
  color_palette_text: string;
  dietary_notes: string;
  notes: string;
}

// API response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// Menu with schedule and inventory for display
export interface MenuItemWithAvailability extends MenuItem {
  inventory: Inventory | null;
  schedule: MenuSchedule | null;
  availableQuantity: number;
  isSoldOut: boolean;
}

// Translation content types
export interface TranslatableContent {
  en: string;
  es: string;
  pt: string;
}
