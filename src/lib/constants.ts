// Guiltless Cakes Constants

export const SITE_NAME = 'Guiltless Cakes';
export const SITE_DESCRIPTION = 'A boutique home bakery in Northeast Philadelphia specializing in cupcakes, slices, and custom celebration cakes.';

// Business Configuration
export const PICKUP_DAY = 5; // Friday (0 = Sunday, 5 = Friday)
export const DEFAULT_SERVICE_FEE_RATE = 0.05; // 5%
export const MAX_INQUIRY_IMAGES = 5;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// Pickup Windows
export const PICKUP_WINDOWS = [
  { label: '10:00 AM - 12:00 PM', start: '10:00', end: '12:00' },
  { label: '12:00 PM - 2:00 PM', start: '12:00', end: '14:00' },
  { label: '2:00 PM - 4:00 PM', start: '14:00', end: '16:00' },
  { label: '4:00 PM - 6:00 PM', start: '16:00', end: '18:00' },
];

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
  { value: 'ready', label: 'Ready for Pickup', color: 'bg-blue-100 text-blue-800' },
  { value: 'picked_up', label: 'Picked Up', color: 'bg-gray-100 text-gray-800' },
  { value: 'canceled', label: 'Canceled', color: 'bg-red-100 text-red-800' },
] as const;

// Inquiry Statuses
export const INQUIRY_STATUSES = [
  { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-800' },
  { value: 'in_review', label: 'In Review', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'quoted', label: 'Quoted', color: 'bg-purple-100 text-purple-800' },
  { value: 'accepted', label: 'Accepted', color: 'bg-green-100 text-green-800' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-orange-100 text-orange-800' },
  { value: 'ready_for_pickup', label: 'Ready for Pickup', color: 'bg-teal-100 text-teal-800' },
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

// Brand Colors
export const BRAND_COLORS = {
  primary: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
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
  { href: '/pickup', label: 'Pickup Info' },
  { href: '/contact', label: 'Contact' },
] as const;

// Social Media Links (placeholder)
export const SOCIAL_LINKS = {
  instagram: 'https://instagram.com/guiltlesscakes',
  facebook: 'https://facebook.com/guiltlesscakes',
};

// Accepted Image Types
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
