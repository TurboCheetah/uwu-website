# uwu.ee

uwu.ee is an anonymous email forwarding landing page: a CRT screen with a custom ASCII mark.

## Stack

- Vite 8.2 and TypeScript 7
- Plain CSS for scanlines, flicker, bloom, and curvature
- Bun 1.4.0, pinned by `packageManager`

## Setup

Install the pinned dependency graph and start the local server:

```bash
bun install --frozen-lockfile
bun run dev
```

Open <http://localhost:5173>.

## Verification

```bash
bun run format:check
bun run lint
bun run typecheck
bun run test
bun run build
```

Optionally audit the locked dependency graph with `bun audit`.

## Page contract

The page is a no-scroll viewport with hidden overflow. Check viewport behavior and guard against accidental horizontal clipping rather than requiring a literal zero-overflow document. Keep the custom ASCII mark, CRT overlays, and the spare `[uwu@ee] in [~/mail] $` prompt. Do not add invite gating or background video.
