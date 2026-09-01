# AGENTS.md

Pragmatic maintainer guide for `uwu.ee`, the anonymous email forwarding landing page.

## Architecture

- Bun 1.4.0 manages a frozen lockfile.
- Next.js 16.3 and React 19.2 render the landing page through the App Router in `app/`.
- The Pages API route `pages/api/auth.ts` serves `/api/auth`.
- Strict TypeScript 7 uses the Next plugin and Bundler module resolution.
- Tailwind CSS 4 is CSS-first; ShadCN primitives live in `components/ui/`.

Do not infer hosting or deployment behavior that is not represented in repository automation.

## Quick commands

```bash
bun install --frozen-lockfile
bun run dev
bun run format:check
bun run lint
bun run typecheck
bun run test
bun run build
```

Useful focused checks:

```bash
bun run test:auth
bun test tests/tooling.test.ts
bun audit
```

Run commands from the repository root. Use the frozen install command rather than updating the lockfile during unrelated work.

## Tooling and conventions

- OXFmt uses its defaults plus the repository ignore list. Run `bun run format` to write formatting, then `bun run format:check` to verify it.
- OXLint provides syntax-aware correctness and suspicious-rule coverage. It is intentionally not type-aware and does not use tsgolint; `bun run typecheck` is the separate semantic type gate.
- Keep TypeScript strict, preserve the Next plugin, Bundler resolution, `#/*` root alias, and type-only imports where appropriate. Do not add a legacy `baseUrl` requirement.
- App Router files belong in `app/`; the existing API stays in `pages/api/`. Shared ShadCN primitives belong in `components/ui/`, and reusable helpers belong in `lib/`. Use the `#/*` alias for root imports.
- Components and exported types use PascalCase; functions and local values use camelCase. Add `"use client"` only where browser state, effects, or handlers require it.
- `next-env.d.ts` and `*.tsbuildinfo` are generated and ignored. Never commit them.

Tests live in `tests/`: `tests/auth.test.ts` protects endpoint behavior and `tests/tooling.test.ts` protects repository artifacts and documentation contracts. Prefer focused tests while iterating, then run the full suite.

## Authentication contract

`INVITE_CODE` is server-only. Never send it to client code, include it in logs or errors, or commit it in an environment file. Preserve this exact `/api/auth` response contract:

- Any non-`POST` request, including a missing method, returns `405`, `{ authorized: false }`, and `Allow: POST`.
- A missing, empty, or blank configured `INVITE_CODE` returns fail-closed `503`.
- A malformed body, a missing or non-string `inviteCode`, or an empty/blank submitted value returns `400`.
- A non-empty but wrong code returns `401`.
- Only the exact configured string returns `200` with `{ authorized: true }`.

Do not trim or normalize accepted values: surrounding whitespace, Unicode, and distinct UTF-16 code-unit sequences are meaningful own data and must compare as exact strings. Keep the timing-safe design: independently hash each value from its own UTF-16LE data to fixed-length digests, then use `timingSafeEqual`. Continue treating request bodies as hostile, including inherited properties, throwing getters, and revoked proxies.

## Styling and UI invariants

- Keep Tailwind CSS 4 CSS-first configuration in `app/globals.css`; do not recreate a JavaScript Tailwind config.
- Preserve the semantic HSL token coordinates, `--radius: 0rem`, system font stack, accessible hidden outlines, and the sRGB `color-mix` gradient compatibility behavior.
- Preserve the centered heading, invite-code form, ShadCN `Input` and `Button`, and `ArrowRight` submit icon.
- The landing page is an intentional no-scroll viewport with hidden overflow; its document geometry can still extend vertically. On narrow and short screens, verify viewport behavior and guard against accidental horizontal clipping whenever layout classes change.
- Preserve this exact public video source order and assets: AV1 MP4 (`public/assets/bg_av1.mp4`) → WebM (`public/assets/bg.webm`) → fallback MP4 (`public/assets/bg.mp4`).

## Automation and dependency updates

CI pins `oven-sh/setup-bun` to the same Bun version as `packageManager`, then performs a frozen install followed by formatting, lint, typecheck, full tests, and build. Quality is the merge gate. CodeQL remains a separate least-privilege JavaScript/TypeScript security scan. Renovate groups coupled Bun runtime, Next/React, Tailwind, and Oxc updates and may automerge eligible non-major updates. Keep automation changes scoped and verify pinned action digests if automation is intentionally edited.

## Before committing

1. Run `bun run format`, then run `bun run format:check` twice if formatting artifacts changed.
2. Run `bun run lint`, `bun run typecheck`, focused tests, `bun run test`, and `bun run build`.
3. Run `bun audit` when dependency or security-sensitive behavior is involved.
4. Inspect `git diff --check`, `git diff --stat`, and `git status --short`; ensure generated files, secrets, and unrelated edits are absent.
5. Commit only the requested scope. Never push unless explicitly asked.
