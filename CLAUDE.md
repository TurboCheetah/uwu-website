# CLAUDE.md - AI Assistant Guide for uwu.ee

This document provides comprehensive guidance for AI assistants working with the uwu.ee codebase.

## Project Overview

**uwu.ee** is an anonymous email forwarding service landing page built with Next.js 13. The application features an invite code authentication system with a visually appealing interface using video backgrounds and DaisyUI components.

### Tech Stack
- **Framework**: Next.js 13.5.11 (using App Router)
- **Language**: TypeScript 4.9.5 (strict mode enabled)
- **Styling**: Tailwind CSS 3.x + DaisyUI 2.50.0
- **Runtime**: Node.js with React 18.3.1
- **Package Manager**: npm

### Key Characteristics
- Single-page application with invite code authentication
- Client-side React components with form validation
- API route for authentication
- Custom DaisyUI theme with purple/indigo primary colors
- Video background with multiple format support (AV1, WebM, MP4)
- Toast notifications for user feedback

---

## Directory Structure

```
uwu-website/
├── app/                      # Next.js 13 App Router
│   ├── globals.css          # Global styles (Tailwind imports)
│   ├── head.tsx             # Meta tags and SEO configuration
│   ├── layout.tsx           # Root layout component
│   └── page.tsx             # Home page with invite form
├── pages/
│   └── api/
│       └── auth.ts          # Authentication API endpoint
├── public/
│   └── assets/
│       ├── bg_av1.mp4       # Background video (AV1)
│       ├── bg.webm          # Background video (WebM)
│       └── bg.mp4           # Background video (MP4)
├── .github/
│   ├── workflows/
│   │   └── codeql-analysis.yml  # Security scanning
│   └── renovate.json        # Dependency automation config
├── .eslintrc.json           # ESLint configuration
├── next.config.js           # Next.js configuration
├── tailwind.config.js       # Tailwind + DaisyUI config
├── tsconfig.json            # TypeScript configuration
├── postcss.config.js        # PostCSS configuration
└── package.json             # Dependencies and scripts
```

---

## Codebase Conventions

### TypeScript Standards
- **Strict Mode**: Always enabled (`tsconfig.json:7`)
- **Type Safety**: Explicit types preferred, avoid `any` except for error handling
- **Imports**: Use path aliases with `#/*` for root-level imports
- **Naming**:
  - Components: PascalCase
  - Functions: camelCase
  - Types/Interfaces: PascalCase with descriptive names

### React/Next.js Patterns
- **Client Components**: Use `"use client"` directive when hooks or interactivity needed (see `app/page.tsx:1`)
- **Server Components**: Default for App Router components (no directive needed)
- **Form Handling**: Controlled components with state management
- **API Routes**: Located in `pages/api/` for Next.js 13 compatibility
- **Styling**: Tailwind utility classes with DaisyUI component classes

### Code Style
- **ESLint**: Extends `next/core-web-vitals` (`.eslintrc.json:2`)
- **Formatting**: Consistent with Next.js conventions
- **State Management**: useState hooks for local state
- **Side Effects**: useEffect with proper cleanup
- **Error Handling**: Try-catch with user-friendly error messages

### Git Workflow
- **Main Branch**: `master` (not `main`)
- **Branch Naming**: Use `claude/` prefix for AI-assisted branches
- **Commits**: Clear, descriptive messages following conventional commits style
- **Pull Requests**: Target `master` branch

---

## Development Workflows

### Local Development

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

### Environment Variables
The application uses environment variables for configuration:

- `INVITE_CODE`: Required for authentication API (`pages/api/auth.ts:8`)

Create a `.env.local` file:
```env
INVITE_CODE=your_invite_code_here
```

### Adding New Features

1. **New Pages**: Create files in `app/` directory
   - `app/about/page.tsx` → `/about` route
   - Use `layout.tsx` for shared layouts

2. **New API Routes**: Create files in `pages/api/`
   - `pages/api/example.ts` → `/api/example` endpoint
   - Follow the pattern in `auth.ts`

3. **Styling Changes**:
   - Use Tailwind utility classes
   - Reference DaisyUI components: https://daisyui.com/components/
   - Custom theme colors in `tailwind.config.js:15-24`

4. **Type Definitions**:
   - Add types alongside usage or in separate `.d.ts` files
   - Use `NextApiRequest` and `NextApiResponse` for API routes

---

## Architecture Patterns

### Authentication Flow
1. User enters invite code in form (`app/page.tsx:119-146`)
2. Form submission prevented, data sent to `/api/auth` (`app/page.tsx:27-33`)
3. API validates against environment variable (`pages/api/auth.ts:8`)
4. Response triggers toast notification (`app/page.tsx:53-97`)

### State Management
- **Local State**: useState for form data, errors, success states
- **UI State**: Separate state for alerts and visibility
- **Cleanup**: useEffect with timeout cleanup for auto-hiding alerts

### Styling Architecture
- **Global Styles**: `app/globals.css` (minimal, just Tailwind imports)
- **Component Styles**: Inline Tailwind classes
- **Theme**: DaisyUI theme called "main" with custom colors
- **Responsive**: Mobile-first with Tailwind breakpoints (md:, lg:)

---

## Key Files Reference

### `app/page.tsx`
- Main landing page component
- Client-side form with controlled inputs
- Toast notifications for success/error states
- Video background with fallbacks
- **Important**: Uses "use client" directive

### `pages/api/auth.ts`
- Authentication endpoint
- Validates invite code against environment variable
- Returns JSON with authorization status
- **Note**: Contains typo in export (`hander` instead of `handler` at line 7)

### `tailwind.config.js`
- Custom DaisyUI theme configuration
- Primary color: `#818CF8` (indigo)
- Content paths for Tailwind purging
- Full theme object at lines 15-24

### `tsconfig.json`
- Strict mode enabled
- Path alias: `#/*` maps to project root
- Next.js plugin configured
- ES5 target for broad compatibility

---

## Common Tasks for AI Assistants

### 1. Adding New Components
```typescript
// app/components/Example.tsx
export default function Example() {
  return (
    <div className="card bg-base-100 shadow-xl">
      {/* Component content */}
    </div>
  );
}
```

### 2. Creating API Endpoints
```typescript
// pages/api/example.ts
import type { NextApiRequest, NextApiResponse } from "next";

type ResponseData = {
  message: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  res.status(200).json({ message: "Success" });
}
```

### 3. Modifying Theme Colors
Edit `tailwind.config.js`:
```javascript
daisyui: {
  themes: [
    {
      main: {
        primary: "#NEW_COLOR",
        // ... other colors
      },
    },
  ],
},
```

### 4. Adding Meta Tags
Update `app/head.tsx`:
```typescript
<meta property="og:image" content="https://example.com/image.png" />
```

---

## Testing & Quality Assurance

### Security
- **CodeQL Analysis**: Runs on push/PR to master, weekly schedule (`.github/workflows/codeql-analysis.yml`)
- **Security Practices**:
  - Environment variables for secrets
  - Input validation on API routes
  - TypeScript for type safety

### Dependency Management
- **Renovate Bot**: Automated dependency updates (`.github/renovate.json`)
- **Auto-merge**: Minor and patch updates auto-merge
- **Schedule**: Updates run before 12pm on Sundays
- **Grouping**: All non-major updates grouped together

### Linting
```bash
npm run lint
```
Uses Next.js core-web-vitals ESLint config for best practices.

---

## Important Notes for AI Assistants

### Known Issues
1. **Typo in `pages/api/auth.ts:7`**: Export named `hander` instead of `handler` (functional but incorrect)
2. **Experimental App Dir**: Uses `experimental.appDir` flag in Next.js 13 (now stable in newer versions)

### Do's ✅
- Use TypeScript with explicit types
- Follow existing component patterns (client vs server)
- Maintain DaisyUI class naming conventions
- Test form validation and API responses
- Preserve video fallback order (AV1 → WebM → MP4)
- Use path aliases (#/*) for cleaner imports
- Keep styling consistent with existing Tailwind patterns

### Don'ts ❌
- Don't add dependencies without checking package.json first
- Don't modify ESLint config without good reason
- Don't break mobile responsiveness (test sm/md/lg breakpoints)
- Don't hardcode sensitive values (use environment variables)
- Don't remove video fallbacks (browser compatibility)
- Don't change the DaisyUI theme without approval
- Don't push to master directly (use feature branches)

### When Making Changes
1. **Read before modifying**: Always read existing files before making changes
2. **Preserve patterns**: Follow established code patterns
3. **Test thoroughly**: Check both success and error cases
4. **Type safety**: Ensure TypeScript compilation succeeds
5. **Responsive design**: Test mobile, tablet, and desktop views
6. **Browser compatibility**: Consider video format support, CSS features

### Deployment Considerations
- Build command: `npm run build`
- Start command: `npm start`
- Requires Node.js environment
- Environment variables must be set in deployment platform
- Static assets in `public/` directory served at root

---

## DaisyUI Component Reference

Common components used in this project:

- **alert**: Notification boxes (`.alert-success`, `.alert-error`)
- **btn**: Buttons (`.btn-primary`, `.btn-square`)
- **input**: Form inputs (`.input-bordered`)
- **toast**: Toast notifications (`.toast-top`, `.toast-end`)
- **form-control**: Form wrapper class
- **input-group**: Grouped inputs with buttons

Full documentation: https://daisyui.com/components/

---

## Useful Commands Cheatsheet

```bash
# Development
npm run dev          # Start dev server on port 3000
npm run build        # Create production build
npm run start        # Start production server
npm run lint         # Run ESLint

# Git workflow (for AI assistants)
git checkout -b claude/feature-name-{sessionId}
git add .
git commit -m "feat: descriptive message"
git push -u origin claude/feature-name-{sessionId}

# Dependency management
npm install          # Install dependencies
npm update           # Update dependencies (check Renovate first)
npm outdated         # Check for outdated packages
```

---

## Project Context

This is a landing page for an anonymous email forwarding service. The primary function is to:
1. Present service information with an attractive UI
2. Gate access via invite code system
3. Provide authorization status to users

The codebase is intentionally minimal and focused. When adding features, maintain this simplicity and avoid over-engineering.

---

## Questions?

For Next.js specific questions: https://nextjs.org/docs
For Tailwind CSS: https://tailwindcss.com/docs
For DaisyUI: https://daisyui.com/
For TypeScript: https://www.typescriptlang.org/docs/

---

**Last Updated**: 2026-01-07
**Next.js Version**: 13.5.11
**TypeScript Version**: 4.9.5
