# AGENTS.md

AI coding agent guide for uwu.ee - an anonymous email forwarding service landing page.

## Project Overview

**uwu.ee** is a single-page Next.js application built with:
- **Framework**: Next.js 13.5.11 (App Router with `experimental.appDir`)
- **Language**: TypeScript 4.9.5 (strict mode enabled)
- **Styling**: Tailwind CSS 3.2.4 + DaisyUI 2.50.0
- **Runtime**: Node.js with React 18.3.1
- **Package Manager**: bun

The application features:
- Invite code authentication system with visual feedback
- Video background with multiple format support (AV1, WebM, MP4)
- Toast notifications for user interactions
- Custom DaisyUI theme with purple/indigo primary colors
- Mobile-first responsive design

## Setup Commands

```bash
# Install dependencies
bun install

# Start development server (http://localhost:3000)
bun run dev

# Build for production
bun run build

# Start production server
bun start

# Run linter
bun run lint
```

## Environment Variables

Required environment variable for authentication:

```env
INVITE_CODE=your_invite_code_here
```

- Create `.env.local` in the project root for local development
- Set via Vercel dashboard for production deployment
- **Never commit environment variables or `.env.local` files**

## Code Style & Conventions

### TypeScript Standards
- **Strict Mode**: Always enabled (`tsconfig.json:7`)
- **Type Safety**: Explicit types preferred, avoid `any` except for error handling
- **Path Aliases**: Use `#/*` for root-level imports (`tsconfig.json:24`)
- **Naming**:
  - Components: PascalCase
  - Functions: camelCase
  - Types/Interfaces: PascalCase with descriptive names
  - File names: camelCase for utilities, PascalCase for components

### React/Next.js Patterns
- **Client Components**: Use `"use client"` directive when hooks or interactivity needed
  - Example: `app/page.tsx` (form handling, state management)
- **Server Components**: Default for App Router (no directive needed)
  - Example: `app/layout.tsx` (root layout)
- **API Routes**: Located in `pages/api/` directory for Next.js 13 compatibility
  - Example: `pages/api/auth.ts`
- **Form Handling**: Controlled components with state management
- **Side Effects**: useEffect with proper cleanup (see `app/page.tsx:10-18`)

### Styling Architecture
- **Utility Classes**: Tailwind utility classes for layout and spacing
- **Components**: DaisyUI component classes (alert, btn, input, toast)
- **Theme**: Custom "main" theme with specific colors:
  - Primary: `#818CF8` (indigo)
  - Secondary: `#38BDF8` (sky blue)
  - Base-100: `#000000` (dark background)
- **Responsive**: Mobile-first with Tailwind breakpoints (`md:`, `lg:`)
- **Global Styles**: Minimal (only Tailwind imports in `app/globals.css`)

### ESLint & Code Quality
- **Config**: Extends `next/core-web-vitals` (`.eslintrc.json:2`)
- **Rules**: Follow Next.js best practices and React conventions
- **Before Committing**: Run `bun run lint` to ensure no errors

## File Structure

```
uwu.ee/
├── app/                      # Next.js App Router
│   ├── globals.css          # Global styles (Tailwind imports + body overflow hidden)
│   ├── layout.tsx           # Root layout (server component)
│   └── page.tsx             # Home page with invite form (client component)
├── pages/
│   └── api/
│       └── auth.ts          # Authentication API endpoint
├── public/
│   └── assets/
│       ├── bg_av1.mp4       # Background video (AV1, modern)
│       ├── bg.webm          # Background video (WebM, fallback)
│       └── bg.mp4           # Background video (MP4, legacy fallback)
├── .github/
│   └── workflows/
│       └── codeql-analysis.yml  # Security scanning (runs on push/PR to master)
├── tailwind.config.js       # Tailwind + DaisyUI configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies and scripts
```

## Implementation Guidelines

### When Adding New Components

```typescript
// Client component (with hooks or interactivity)
"use client";
import { useState } from "react";

export default function MyComponent() {
  const [state, setState] = useState(null);

  return (
    <div className="card bg-base-100 shadow-xl">
      {/* Component content */}
    </div>
  );
}

// Server component (default, no directive)
export default function MyServerComponent() {
  return (
    <div className="alert alert-info">
      {/* Server-rendered content */}
    </div>
  );
}
```

### When Creating API Endpoints

```typescript
// pages/api/example.ts
import type { NextApiRequest, NextApiResponse } from "next";

type ResponseData = {
  message: string;
  authorized?: boolean;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Validate request method
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Handle request
  res.status(200).json({ message: "Success" });
}
```

### When Styling Components

- **Use DaisyUI components**: Reference https://daisyui.com/components/
- **Tailwind utilities**: For layout, spacing, and custom styling
- **Responsive classes**: Mobile-first, add `md:` and `lg:` for larger screens
- **Theme colors**: Use DaisyUI semantic classes (primary, secondary, accent, etc.)

```tsx
// Example: Button with DaisyUI + Tailwind
<button className="btn btn-primary btn-square text-white">
  Submit
</button>

// Example: Input with styling
<input
  type="text"
  placeholder="Invite Code"
  className="input input-bordered w-36"
  name="inviteCode"
  onChange={handleChange}
/>
```

## Known Issues & Gotchas

1. **Typo in API Export**: `pages/api/auth.ts:7` exports `hander` instead of `handler` (functional but incorrect)
   - **Action**: Do not replicate this pattern; use correct `handler` naming

2. **Experimental App Dir**: Uses `experimental.appDir: true` in `next.config.js`
   - **Context**: This flag is now stable in Next.js 14+, but required for 13.5.11
   - **Action**: When upgrading Next.js, remove this flag

3. **Body Overflow Hidden**: `app/globals.css:5-8` sets `overflow: hidden` on body/html
   - **Reason**: Prevents scrollbars with full-page video background
   - **Implication**: Content requiring scrolling needs custom scroll containers

4. **Video Format Order**: AV1 → WebM → MP4 (modern to legacy fallback)
   - **Action**: Always maintain this order for browser compatibility

## Security Considerations

- **Environment Variables**: Secrets stored in `process.env` (e.g., `INVITE_CODE`)
- **Input Validation**: API routes validate request body (see `pages/api/auth.ts:8`)
- **CodeQL Analysis**: Runs automatically on push/PR to `master` branch
- **Type Safety**: TypeScript strict mode catches many potential issues
- **Never**:
  - Hardcode sensitive values
  - Commit `.env.local` or `.env` files
  - Expose environment variables to client-side code

## Testing & Quality Assurance

### Before Submitting Changes

1. **TypeScript Compilation**: Ensure no type errors
   ```bash
   bun run build
   ```

2. **ESLint**: Check for code quality issues
   ```bash
   bun run lint
   ```

3. **Manual Testing**:
   - Test form submission (success and error cases)
   - Verify responsive behavior (mobile, tablet, desktop)
   - Check video fallbacks (use browser dev tools to test different video support)
   - Test toast notifications (auto-hide after 5 seconds)

### CodeQL Analysis

- **Triggers**: Push to `master`, PR to `master`, weekly schedule (Mondays 14:28 UTC)
- **Language**: JavaScript/TypeScript
- **Purpose**: Security vulnerability detection
- **Location**: `.github/workflows/codeql-analysis.yml`

## Dependency Management

- **Renovate Bot**: Automated dependency updates (`.github/renovate.json`)
- **Update Schedule**: Before 12pm UTC on Sundays
- **Auto-merge**: Minor and patch updates auto-merged
- **Manual Review**: Major updates require PR review

### Adding Dependencies

```bash
# Add new dependency
bun add package-name

# Add dev dependency
bun add -D package-name

# Update all dependencies (check Renovate first)
bun update
```

**Before adding new dependencies**:
- Check if existing packages provide needed functionality
- Consider bundle size impact
- Verify compatibility with Next.js 13.5.11
- Review if dependency is actively maintained

## Git Workflow

- **Main Branch**: `master` (not `main`)
- **Feature Branches**: Use `claude/` prefix for AI-assisted work
  - Example: `claude/feature-auth-{sessionId}`
- **Pull Requests**: Always target `master` branch
- **Commit Messages**: Conventional commits style
  - `feat:` for new features
  - `fix:` for bug fixes
  - `refactor:` for code refactoring
  - `docs:` for documentation changes

### Standard Commit Workflow

```bash
# Create feature branch
git checkout -b claude/feature-name-{sessionId}

# Make changes and stage
git add .

# Commit with descriptive message
git commit -m "feat: add user authentication with invite codes"

# Push to remote
git push -u origin claude/feature-name-{sessionId}

# Create PR (target master)
gh pr create --title "Add user authentication" --body "..."
```

## Deployment

- **Platform**: Vercel (automatic deployments)
- **Build Command**: `bun run build`
- **Start Command**: `bun start`
- **Runtime**: Requires Bun runtime environment
- **Environment Variables**: Set in Vercel dashboard
- **Auto-Deploy**: Pushes to configured branches trigger deployment

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] ESLint clean
- [ ] Environment variables configured
- [ ] Video assets optimized and present in `public/assets/`
- [ ] Responsive design tested on multiple viewports

## Common Patterns

### Form Handling

```typescript
"use client";
import { useState, FormEvent, ChangeEvent } from "react";

export default function MyForm() {
  const [formData, setFormData] = useState({ field: "" });
  const [error, setError] = useState<null | string>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/endpoint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.status === 200) {
        setSuccess(true);
      } else {
        setError("Operation failed");
      }
    } catch (err: any) {
      setError(`Something went wrong: ${err.message}`);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### Toast Notifications

```typescript
// State
const [showAlert, setShowAlert] = useState(true);

useEffect(() => {
  if (showAlert) {
    const timeout = setTimeout(() => setShowAlert(false), 5000);
    return () => clearTimeout(timeout);
  }
}, [showAlert]);

// JSX
{showAlert && success && (
  <div className="toast toast-top toast-end">
    <div className="alert alert-success">
      <div>
        <svg className="stroke-current flex-shrink-0 h-6 w-6">
          {/* Success icon path */}
        </svg>
        <span>Success message</span>
      </div>
    </div>
  </div>
)}
```

## Troubleshooting

### Build Failures

1. **TypeScript Errors**: Check strict mode compliance, ensure explicit types
2. **Import Errors**: Verify path aliases (`#/*`) are correct
3. **Missing Dependencies**: Run `bun install`

### Runtime Errors

1. **API 404**: Ensure API routes in `pages/api/` directory
2. **Environment Variables**: Check `.env.local` exists with required values
3. **Video Not Loading**: Verify assets in `public/assets/` with correct paths

### Styling Issues

1. **DaisyUI Not Working**: Confirm plugin in `tailwind.config.js:11`
2. **Tailwind Classes Not Applied**: Check content paths in `tailwind.config.js:3-7`
3. **Theme Colors Not Applied**: Verify theme configuration in `tailwind.config.js:12-28`

## Additional Resources

- **Next.js**: https://nextjs.org/docs
- **React**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **DaisyUI**: https://daisyui.com/components/
- **Bun**: https://bun.sh/docs

## Contact & Support

For project-specific questions or issues, refer to:
- **CLAUDE.md**: Comprehensive AI assistant guide
- **README.md**: Project overview and getting started guide
- **GitHub Issues**: Report bugs or request features

---

**Last Updated**: 2026-01-09
**Next.js Version**: 13.5.11
**TypeScript Version**: 4.9.5
**DaisyUI Version**: 2.50.0
