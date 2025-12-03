/**
 * Repository Interfaces - Dependency Inversion Principle
 *
 * These interfaces define contracts for data access, allowing
 * the application to depend on abstractions rather than concrete implementations.
 */

import type {
  MenuItem,
  MenuItemTranslation,
  MenuSchedule,
  Inventory,
  Order,
  OrderItem,
  Inquiry,
  InquiryImage,
  Quote,
  PickupWindow,
  Profile,
  Settings,
  OrderStatus,
  InquiryStatus,
  QuoteStatus,
} from '@/types';

// Base CRUD operations interface - Interface Segregation Principle
export interface IReadRepository<T, ID = string> {
  findById(id: ID): Promise<T | null>;
  findAll(options?: QueryOptions): Promise<T[]>;
  count(options?: QueryOptions): Promise<number>;
}

export interface IWriteRepository<T, CreateDTO, UpdateDTO, ID = string> {
  create(data: CreateDTO): Promise<T>;
  update(id: ID, data: UpdateDTO): Promise<T>;
  delete(id: ID): Promise<void>;
}

export interface ICrudRepository<T, CreateDTO, UpdateDTO, ID = string>
  extends IReadRepository<T, ID>,
    IWriteRepository<T, CreateDTO, UpdateDTO, ID> {}

// Query options for filtering and pagination
export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  filters?: Record<string, unknown>;
}

// ============================================
// Menu Item Repository
// ============================================
export interface CreateMenuItemDTO {
  slug: string;
  base_price: number;
  image_url?: string | null;
  dietary_tags?: string[];
  category?: string | null;
  active?: boolean;
  translations: CreateMenuItemTranslationDTO[];
}

export interface UpdateMenuItemDTO {
  slug?: string;
  base_price?: number;
  image_url?: string | null;
  dietary_tags?: string[];
  category?: string | null;
  active?: boolean;
}

export interface CreateMenuItemTranslationDTO {
  language: 'en' | 'es' | 'pt';
  name: string;
  description: string;
  weekly_story_snippet?: string | null;
}

export interface IMenuItemRepository extends ICrudRepository<MenuItem, CreateMenuItemDTO, UpdateMenuItemDTO> {
  findBySlug(slug: string): Promise<MenuItem | null>;
  findActive(): Promise<MenuItem[]>;
  findByCategory(category: string): Promise<MenuItem[]>;
  findWithTranslations(id: string): Promise<MenuItem | null>;
  addTranslation(menuItemId: string, translation: CreateMenuItemTranslationDTO): Promise<MenuItemTranslation>;
  updateTranslation(id: string, data: Partial<CreateMenuItemTranslationDTO>): Promise<MenuItemTranslation>;
  deleteTranslation(id: string): Promise<void>;
}

// ============================================
// Menu Schedule Repository
// ============================================
export interface CreateMenuScheduleDTO {
  menu_item_id: string;
  pickup_date: string;
  is_active?: boolean;
}

export interface UpdateMenuScheduleDTO {
  is_active?: boolean;
}

export interface IMenuScheduleRepository extends ICrudRepository<MenuSchedule, CreateMenuScheduleDTO, UpdateMenuScheduleDTO> {
  findByDate(pickupDate: string): Promise<MenuSchedule[]>;
  findByMenuItem(menuItemId: string): Promise<MenuSchedule[]>;
  findByDateWithItems(pickupDate: string): Promise<MenuSchedule[]>;
}

// ============================================
// Inventory Repository
// ============================================
export interface CreateInventoryDTO {
  menu_item_id: string;
  pickup_date: string;
  daily_cap: number;
  reserved_quantity?: number;
}

export interface UpdateInventoryDTO {
  daily_cap?: number;
  reserved_quantity?: number;
}

export interface IInventoryRepository extends ICrudRepository<Inventory, CreateInventoryDTO, UpdateInventoryDTO> {
  findByMenuItemAndDate(menuItemId: string, pickupDate: string): Promise<Inventory | null>;
  findByDate(pickupDate: string): Promise<Inventory[]>;
  reserveQuantity(menuItemId: string, pickupDate: string, quantity: number): Promise<boolean>;
  releaseQuantity(menuItemId: string, pickupDate: string, quantity: number): Promise<boolean>;
  getAvailableQuantity(menuItemId: string, pickupDate: string): Promise<number>;
}

// ============================================
// Order Repository
// ============================================
export interface CreateOrderDTO {
  user_id: string;
  pickup_date: string;
  pickup_window_id: string;
  subtotal_amount: number;
  service_fee_amount: number;
  tax_amount: number;
  total_amount: number;
  stripe_session_id?: string | null;
  notes?: string | null;
  items: CreateOrderItemDTO[];
}

export interface UpdateOrderDTO {
  status?: OrderStatus;
  notes?: string | null;
}

export interface CreateOrderItemDTO {
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface IOrderRepository extends ICrudRepository<Order, CreateOrderDTO, UpdateOrderDTO> {
  findByUser(userId: string): Promise<Order[]>;
  findByDate(pickupDate: string): Promise<Order[]>;
  findByStatus(status: OrderStatus): Promise<Order[]>;
  findByDateAndStatus(pickupDate: string, status: OrderStatus): Promise<Order[]>;
  findByStripeSession(sessionId: string): Promise<Order | null>;
  findWithItems(id: string): Promise<Order | null>;
  findByDateWithDetails(pickupDate: string): Promise<Order[]>;
  updateStatus(id: string, status: OrderStatus): Promise<Order>;
}

// ============================================
// Inquiry Repository
// ============================================
export interface CreateInquiryDTO {
  user_id: string;
  event_type: string;
  event_date: string;
  servings: number;
  tiers: number;
  shape: string;
  style: string;
  color_palette_text?: string | null;
  dietary_notes?: string | null;
  notes?: string | null;
  image_urls?: string[];
}

export interface UpdateInquiryDTO {
  status?: InquiryStatus;
  notes?: string | null;
}

export interface IInquiryRepository extends ICrudRepository<Inquiry, CreateInquiryDTO, UpdateInquiryDTO> {
  findByUser(userId: string): Promise<Inquiry[]>;
  findByStatus(status: InquiryStatus): Promise<Inquiry[]>;
  findWithImages(id: string): Promise<Inquiry | null>;
  findWithQuotes(id: string): Promise<Inquiry | null>;
  updateStatus(id: string, status: InquiryStatus): Promise<Inquiry>;
  addImage(inquiryId: string, imageUrl: string): Promise<InquiryImage>;
  deleteImage(imageId: string): Promise<void>;
}

// ============================================
// Quote Repository
// ============================================
export interface CreateQuoteDTO {
  inquiry_id: string;
  total_price: number;
  deposit_amount?: number | null;
  deposit_percentage?: number | null;
  expires_at?: string | null;
}

export interface UpdateQuoteDTO {
  total_price?: number;
  deposit_amount?: number | null;
  payment_link_url?: string | null;
  status?: QuoteStatus;
  expires_at?: string | null;
}

export interface IQuoteRepository extends ICrudRepository<Quote, CreateQuoteDTO, UpdateQuoteDTO> {
  findByInquiry(inquiryId: string): Promise<Quote[]>;
  findByStatus(status: QuoteStatus): Promise<Quote[]>;
  updateStatus(id: string, status: QuoteStatus): Promise<Quote>;
}

// ============================================
// Pickup Window Repository
// ============================================
export interface CreatePickupWindowDTO {
  label: string;
  start_time: string;
  end_time: string;
  max_capacity: number;
  active?: boolean;
}

export interface UpdatePickupWindowDTO {
  label?: string;
  start_time?: string;
  end_time?: string;
  max_capacity?: number;
  current_bookings?: number;
  active?: boolean;
}

export interface IPickupWindowRepository extends ICrudRepository<PickupWindow, CreatePickupWindowDTO, UpdatePickupWindowDTO> {
  findActive(): Promise<PickupWindow[]>;
  findAvailable(): Promise<PickupWindow[]>;
  incrementBookings(id: string): Promise<PickupWindow>;
  decrementBookings(id: string): Promise<PickupWindow>;
}

// ============================================
// Profile Repository
// ============================================
export interface CreateProfileDTO {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  preferred_language?: 'en' | 'es' | 'pt';
}

export interface UpdateProfileDTO {
  first_name?: string;
  last_name?: string;
  phone?: string;
  preferred_language?: 'en' | 'es' | 'pt';
}

export interface IProfileRepository extends ICrudRepository<Profile, CreateProfileDTO, UpdateProfileDTO> {
  findByEmail(email: string): Promise<Profile | null>;
  findAdmins(): Promise<Profile[]>;
  setAdmin(id: string, isAdmin: boolean): Promise<Profile>;
}

// ============================================
// Settings Repository
// ============================================
export interface ISettingsRepository {
  get<T = unknown>(key: string): Promise<T | null>;
  set<T = unknown>(key: string, value: T): Promise<void>;
  getAll(): Promise<Settings[]>;
  delete(key: string): Promise<void>;
}
