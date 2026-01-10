# AGENTS.md

AI coding agent guide for uwu.ee - an anonymous email forwarding service landing page.

## Project Overview

**uwu.ee** is a single-page Next.js 13.5.11 application with invite code authentication, built with TypeScript (strict mode), Tailwind CSS, and DaisyUI.

---

## Commands

```bash
# Development
bun run dev          # Start dev server (http://localhost:3000)

# Build & Type Check
bun run build        # Build for production (includes type check)
bun run typecheck:ci # Run TypeScript type check (CI-friendly)

# Linting
bun run lint         # Run ESLint
bun run lint:fix     # Auto-fix ESLint issues
```

**Note**: No test suite exists in this project. Manual testing is required for form submission, responsive design, and video background loading.

---

## Code Style

### TypeScript
- **Strict Mode**: Always enabled (tsconfig.json)
- **Explicit Types**: Use explicit types, avoid `any` except for error handling
- **Type Imports**: Prefer `import type { }` for type-only imports
- **Path Aliases**: Use `#/*` for root-level imports (configured in tsconfig.json)

### Naming Conventions
- **Components**: PascalCase (`MyComponent.tsx`)
- **Functions**: camelCase (`handleSubmit`)
- **Types/Interfaces**: PascalCase with descriptive names (`FormData`)
- **Files**: camelCase for utilities (`utils.ts`), PascalCase for components (`MyComponent.tsx`)

### Imports
- React hooks and types: `import { useState, useEffect, type ChangeEvent } from 'react'`
- Next.js types: `import type { NextApiRequest, NextApiResponse } from 'next'`
- Path aliases: `import { myFunction } from '#/utils/helpers'`

### Error Handling
- **API Errors**: Check `res.status` and handle non-200 responses
- **Catch Blocks**: Use `catch (err: unknown)` and narrow with type guards
- **User Messages**: Provide user-friendly error messages in UI

### Formatting
- **ESLint Config**: Uses `@antfu/eslint-config` with flat config (ESLint 9)
- **Auto-Fix**: Run `bun run lint:fix` before committing
- **No Formatter Config**: Follow ESLint rules (no Prettier/other formatters)

---

## React/Next.js Patterns

### Component Types
- **Client Components**: Add `"use client"` directive when using hooks, state, or event handlers
- **Server Components**: Default for App Router (no directive needed)
- **API Routes**: Use `pages/api/` directory for Next.js 13 compatibility

### State Management
- Use `useState` for local component state
- Separate UI state (alert visibility) from data state (form data)
- Always clean up side effects in `useEffect` (timeouts, subscriptions)

### Styling
- **Tailwind**: Use utility classes for layout, spacing, responsive breakpoints
- **DaisyUI**: Use component classes (btn, input, alert, toast)
- **Theme**: Primary `#818CF8`, Secondary `#38BDF8`, Base-100 `#000000`
- **Responsive**: Mobile-first with `md:` and `lg:` breakpoints

---

## Key Patterns

### Client Component Example
```tsx
'use client'
import { useState } from 'react'

export default function MyForm() {
  const [data, setData] = useState(null)
  // Component logic
}
```

### API Route Example
```typescript
import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }
  res.status(200).json({ message: 'Success' })
}
```

---

## Gotchas

1. **API Export Typo**: `pages/api/auth.ts:7` exports `hander` (should be `handler`)
2. **Experimental Flag**: `next.config.js` uses `experimental.appDir` (required for 13.5.11)
3. **Body Overflow**: `app/globals.css` sets `overflow: hidden` (scrollbar prevention)
4. **Video Fallbacks**: Maintain order: AV1 → WebM → MP4

---

## Pre-Commit Checklist

- [ ] `bun run lint` passes (no errors)
- [ ] `bun run build` passes (no type errors)
- [ ] Manual testing completed (form, responsive, video)
- [ ] No `.env` or `.env.local` files committed

---

## Environment

Required: `INVITE_CODE` in `.env.local` (never commit)
Deployment: Vercel (automatic on push to `master`)
Package Manager: bun
Main Branch: `master` (not `main`)

---

**Last Updated**: 2026-01-09
