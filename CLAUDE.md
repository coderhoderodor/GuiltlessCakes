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

## Git & GitHub Best Practices

### Commit Policy

**When to commit:**
1. After completing a feature, fix, or significant refactor
2. Every 15-20 minutes during longer sessions (WIP commits)
3. Before risky/experimental changes
4. Before switching branches

**Commit message format:**
- Use conventional commits: `feat:`, `fix:`, `refactor:`, `style:`, `docs:`, `chore:`, `test:`
- First line: under 72 characters, imperative mood ("Add feature" not "Added feature")
- Body: explain WHY, not just WHAT (if needed)
- Footer: reference issues with `Closes #123` or `Fixes #123`

**Example:**
```
feat: Add user authentication flow

Implement login/signup with Supabase Auth including:
- Email/password authentication
- Password reset functionality
- Session persistence

Closes #42
```

### Branch Strategy

- **main/master**: Production-ready code only
- **feature branches**: `feat/description` or `feature/description`
- **bugfix branches**: `fix/description` or `bugfix/description`
- **naming**: Use lowercase, hyphens, descriptive names (e.g., `feat/add-checkout-flow`)

### Pull Requests

**Before creating a PR:**
1. Ensure all commits are pushed: `git status`
2. Rebase on latest main if needed: `git pull --rebase origin main`
3. Run tests/build to verify: `npm run build`

**PR best practices:**
- Use descriptive titles with conventional commit prefix
- Include summary of changes in description
- Reference related issues
- Add screenshots for UI changes
- Request reviews from relevant team members

### Never Commit

- `.env.local` or files containing secrets
- `node_modules/`
- `.next/` build artifacts
- Large binary files (use Git LFS if needed)
- Console.log debugging statements
- Commented-out code blocks

### Push Policy

- Push to remote regularly (at least end of each session)
- Always push before ending work to preserve progress
- Use `git push -u origin branch-name` for new branches

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
