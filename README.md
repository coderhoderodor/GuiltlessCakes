# Guiltless Cakes

A modern web-based ordering platform for Guiltless Cakes, a boutique home bakery in Northeast Philadelphia.

## Features

### Customer Features
- **Weekly Rotating Menu**: Browse and order from a fresh weekly menu of cupcakes, slices, and cakes
- **Custom Cake Inquiries**: Submit detailed custom cake requests with image uploads for special events
- **User Accounts**: Manage orders, view order history, and update account settings
- **Shopping Cart**: Add items, select pickup windows, and checkout securely
- **Multilingual Support**: Available in English, Spanish, and Portuguese

### Admin Features
- **Dashboard**: Overview of orders, inquiries, and revenue
- **Menu Management**: Create, edit, and schedule menu items with inventory tracking
- **Order Management**: View and update order statuses by pickup window
- **Inquiry Management**: Review custom cake inquiries and create quotes
- **Settings**: Configure service fees, pickup instructions, and business information

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe Checkout
- **Email**: Resend
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Stripe account
- Resend account (for emails)

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_APP_URL`

### Database Setup

1. Create a new Supabase project
2. Run the SQL schema from `supabase/schema.sql` in the SQL Editor
3. Set up Storage buckets for inquiry images

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard pages
│   ├── account/           # User account pages
│   ├── auth/              # Authentication pages
│   ├── api/               # API routes
│   └── ...                # Public pages
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── layout/           # Layout components
│   ├── menu/             # Menu-related components
│   └── cart/             # Cart components
├── contexts/              # React contexts
├── hooks/                 # Custom hooks
├── lib/                   # Utility libraries
│   ├── supabase/         # Supabase client
│   ├── stripe/           # Stripe integration
│   └── email/            # Email service
└── types/                 # TypeScript types
```

## Business Model

- **Weekly Cycle**: Orders placed by Wednesday 11:59 PM for Friday pickup
- **Pickup Only**: Northeast Philadelphia location, 10 AM - 6 PM Fridays
- **Two-Hour Windows**: Customers select from 4 pickup windows
- **Custom Cakes**: Minimum 1-month lead time, quotes via email

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## License

Private - All rights reserved.
