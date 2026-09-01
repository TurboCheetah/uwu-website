# AGENTS.md

Pragmatic maintainer guide for `uwu.ee`, a quiet CRT landing page for anonymous email forwarding.

## Architecture

- Bun 1.4.0 manages a frozen lockfile.
- Vite 8.2 builds a static TypeScript page from `index.html` and `src/`.
- Strict TypeScript 7 uses Bundler module resolution. There is no Next plugin and no `baseUrl`.
- Plain CSS in `src/style.css` owns the CRT look. Do not add a utility-class CSS config or a component library.

Vercel is configured in `vercel.json` as the Vite preset: frozen Bun install, `bun run build`, and static output from `dist`. Do not infer other hosting behavior.

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
bun test tests/tooling.test.ts
bun audit
```

Run commands from the repository root. Use the frozen install command rather than updating the lockfile during unrelated work.

## Tooling and conventions

- OXFmt uses its defaults plus the repository ignore list. `src/logo.ts` is ignored so the ASCII mark is not reflowed. Run `bun run format` to write formatting, then `bun run format:check` to verify it.
- OXLint provides syntax-aware correctness and suspicious-rule coverage. It is intentionally not type-aware and does not use tsgolint; `bun run typecheck` is the separate semantic type gate.
- Keep TypeScript strict, Bundler resolution, and type-only imports where appropriate. Do not add a legacy `baseUrl` requirement.
- Page markup lives in `index.html`. The ASCII mark lives in `src/logo.ts`. CRT styles live in `src/style.css`. Shared helpers belong in `src/` if they are needed. There is no App Router, Pages API, or `components/ui/` tree.
- Keep names boring: exported values use camelCase unless they are types, which use PascalCase. The page has no client framework runtime.
- `*.tsbuildinfo` is generated and ignored. Never commit it.

Tests live in `tests/`. `tests/tooling.test.ts` protects repository artifacts and documentation contracts. Prefer focused tests while iterating, then run the full suite.

## Product

This is still an anonymous email forwarding landing page. The page is the envelope ASCII mark, the caption `Anonymous email forwarding service`, and CRT effects. Do not add a shell prompt, heading, invite gating, authentication endpoints, forms, dashboards, or background video sources.

## Styling and UI invariants

- Keep a custom ASCII envelope for uwu / uwu.ee, drawn with `uwu` / `owo` / `qwq` texture, not a generic font lockup. Highlight the center `«uwu»` seal without shrinking its column width. Do not reflow `src/logo.ts` with the formatter.
- Keep CRT scanlines, flicker, bloom, and slight curvature in plain CSS. Disable the flicker animation when `prefers-reduced-motion: reduce` is set.
- Keep the indigo tokens `--main: #818cf8`, `--greyed: #7b82c9`, and `--text: #dfdfdf`.
- Keep the caption `Anonymous email forwarding service` in white (`#ffffff`) with the same CRT prompt glow (`0 0 5px #292929` and `0 0 5px #ffffff`). Do not add a shell prompt.
- The landing page is an intentional no-scroll viewport with hidden overflow; its document geometry can still extend vertically. On narrow and short screens, verify viewport behavior and guard against accidental horizontal clipping whenever layout classes change.
- Public metadata stays `title: uwu`, `description: OwO What’s This`, `og:url: https://uwu.ee/`, and `theme-color: #818CF8`.

## Automation and dependency updates

CI pins `oven-sh/setup-bun` to the same Bun version as `packageManager`, then performs a frozen install followed by formatting, lint, typecheck, full tests, and build. Quality is the merge gate. CodeQL remains a separate least-privilege JavaScript/TypeScript security scan. Renovate groups coupled Bun runtime and Oxc updates and may automerge eligible non-major updates. Keep automation changes scoped and verify pinned action digests if automation is intentionally edited.

## Before committing

1. Run `bun run format`, then run `bun run format:check` twice if formatting artifacts changed.
2. Run `bun run lint`, `bun run typecheck`, focused tests, `bun run test`, and `bun run build`.
3. Run `bun audit` when dependency or security-sensitive behavior is involved.
4. Inspect `git diff --check`, `git diff --stat`, and `git status --short`; ensure generated files, secrets, and unrelated edits are absent.
5. Commit only the requested scope. Never push unless explicitly asked.
