// Guiltless Sweets Constants (business is Guiltless Cakes)

export const SITE_NAME = 'Guiltless Sweets';
export const SITE_DESCRIPTION = 'A boutique home bakery in Northeast Philadelphia specializing in cupcakes, slices, and custom celebration cakes.';

// Business Configuration
export const DEFAULT_SERVICE_FEE_RATE = 0.05; // 5%
export const MAX_INQUIRY_IMAGES = 5;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// Delivery Configuration
export const DELIVERY_DAYS = [5, 6] as const; // Friday and Saturday (0 = Sunday)
export const DELIVERY_FEE = 8.00; // Fee for orders under $50
export const FREE_DELIVERY_MINIMUM = 50.00; // Free delivery threshold
export const DELIVERY_RADIUS_MILES = 20;
export const DELIVERY_CENTER_ZIP = '19136'; // Northeast Philadelphia

// Delivery Windows (same as previous pickup windows)
export const DELIVERY_WINDOWS = [
  { label: '10:00 AM - 12:00 PM', start: '10:00', end: '12:00' },
  { label: '12:00 PM - 2:00 PM', start: '12:00', end: '14:00' },
  { label: '2:00 PM - 4:00 PM', start: '14:00', end: '16:00' },
  { label: '4:00 PM - 6:00 PM', start: '16:00', end: '18:00' },
];

// Legacy aliases for backwards compatibility
export const PICKUP_DAY = 5; // @deprecated Use DELIVERY_DAYS instead
export const PICKUP_WINDOWS = DELIVERY_WINDOWS; // @deprecated Use DELIVERY_WINDOWS instead

// Dietary Tags
export const DIETARY_TAGS = [
  { value: 'vegan', label: 'Vegan' },
  { value: 'gluten-free', label: 'Gluten-Free' },
  { value: 'nut-free', label: 'Nut-Free' },
  { value: 'dairy-free', label: 'Dairy-Free' },
  { value: 'egg-free', label: 'Egg-Free' },
] as const;

// Event Types for Custom Cakes
export const EVENT_TYPES = [
  { value: 'birthday', label: 'Birthday' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'anniversary', label: 'Anniversary' },
  { value: 'graduation', label: 'Graduation' },
  { value: 'baby_shower', label: 'Baby Shower' },
  { value: 'other', label: 'Other' },
] as const;

// Cake Shapes
export const CAKE_SHAPES = [
  { value: 'round', label: 'Round' },
  { value: 'square', label: 'Square' },
  { value: 'rectangular', label: 'Rectangular' },
  { value: 'heart', label: 'Heart' },
  { value: 'other', label: 'Other' },
] as const;

// Decoration Styles
export const DECORATION_STYLES = [
  { value: 'simple', label: 'Simple' },
  { value: 'semi_naked', label: 'Semi-Naked' },
  { value: 'floral', label: 'Floral' },
  { value: 'textured', label: 'Textured' },
  { value: 'drip', label: 'Drip' },
  { value: 'buttercream', label: 'Buttercream' },
  { value: 'fondant', label: 'Fondant' },
  { value: 'other', label: 'Other' },
] as const;

// Number of Tiers
export const TIER_OPTIONS = [1, 2, 3, 4] as const;

// Order Statuses
export const ORDER_STATUSES = [
  { value: 'paid', label: 'Paid', color: 'bg-green-100 text-green-800' },
  { value: 'prepping', label: 'Prepping', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'ready', label: 'Ready for Delivery', color: 'bg-blue-100 text-blue-800' },
  { value: 'out_for_delivery', label: 'Out for Delivery', color: 'bg-purple-100 text-purple-800' },
  { value: 'delivered', label: 'Delivered', color: 'bg-gray-100 text-gray-800' },
  { value: 'canceled', label: 'Canceled', color: 'bg-red-100 text-red-800' },
] as const;

// Inquiry Statuses
export const INQUIRY_STATUSES = [
  { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-800' },
  { value: 'in_review', label: 'In Review', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'quoted', label: 'Quoted', color: 'bg-purple-100 text-purple-800' },
  { value: 'accepted', label: 'Accepted', color: 'bg-green-100 text-green-800' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-orange-100 text-orange-800' },
  { value: 'ready_for_delivery', label: 'Ready for Delivery', color: 'bg-teal-100 text-teal-800' },
  { value: 'completed', label: 'Completed', color: 'bg-gray-100 text-gray-800' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
  { value: 'closed', label: 'Closed', color: 'bg-gray-100 text-gray-800' },
] as const;

// Languages
export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
] as const;

// Guiltless Sweets Brand Colors
export const BRAND_COLORS = {
  white: '#FFFFFF',
  blush: '#FFE8E8',      // Light Pink/Blush
  rose: '#EBB4B2',       // Dusty Rose - Primary
  blue: '#D3F3FF',       // Light Blue - Accent
  roseHover: '#C9A09E',  // Darker rose for hover
  primary: {
    50: '#FFF5F5',
    100: '#FFE8E8',
    200: '#F5D5D3',
    300: '#EBB4B2',
    400: '#E09D9A',
    500: '#D58583',
    600: '#EBB4B2',
    700: '#C9A09E',
    800: '#A8807E',
    900: '#876562',
  },
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
};

// Navigation Links
export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/menu', label: 'Menu' },
  { href: '/custom-cakes', label: 'Custom Cakes' },
  { href: '/about', label: 'About' },
  { href: '/delivery', label: 'Delivery Info' },
  { href: '/contact', label: 'Contact' },
] as const;

// Social Media Links (placeholder)
export const SOCIAL_LINKS = {
  instagram: 'https://instagram.com/guiltlesssweets',
  facebook: 'https://facebook.com/guiltlesssweets',
};

// Accepted Image Types
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
