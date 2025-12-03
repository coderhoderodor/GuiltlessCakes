# Claude Code Instructions for GuiltlessCakes

## Dev Server Management

**CRITICAL: Before starting any work, always check for and kill stale dev servers:**

```bash
# Kill all Next.js processes
pkill -9 -f "next" 2>/dev/null

# Clear the .next cache
rm -rf .next

# Then start fresh
npm run dev
```

**After making CSS/styling changes:**
1. Remind user to hard refresh: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)
2. If changes still don't appear, kill the dev server and restart fresh
3. Check that only ONE dev server is running: `lsof -i :3000 | grep LISTEN`

## Tech Stack

- **Framework**: Next.js 16 with Turbopack
- **Styling**: Tailwind CSS v4 (uses `@tailwindcss/postcss`, `@import "tailwindcss"`)
- **CSS Utilities**: `tailwind-merge` for class conflict resolution via `cn()` utility
- **React**: React 19
- **Database**: Supabase

## Design System

This is a **luxury bakery website** with a Shopify-store aesthetic:
- Very spacious, generous whitespace
- Small elegant text with generous padding
- Pill-shaped buttons (`rounded-full`)
- Soft pink brand colors

### Spacing Guidelines

| Element | Typical Value |
|---------|---------------|
| Section padding | `py-32` to `py-64` |
| Form field gaps | `space-y-14` |
| Grid gaps | `gap-10` to `gap-14` |
| Card padding | `p-10` to `p-16` |
| Button text | `text-[10px]` to `text-[12px]` |

## Common Issues

### Changes not appearing
1. Multiple dev servers may be running - kill all and restart
2. Browser cache - hard refresh or use incognito
3. Turbopack cache - delete `.next` folder

### Tailwind classes not working
- Tailwind v4 generates classes on-demand
- If a class doesn't work, verify it's in the compiled CSS:
  ```bash
  grep "class-name" .next/dev/static/chunks/*.css
  ```
