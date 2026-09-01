# uwu.ee

`uwu.ee` is the landing page for an anonymous email forwarding service. It presents an invite-code form over a responsive, no-scroll video background.

## Stack

- Next.js 16.3 App Router UI with a Pages API endpoint at `/api/auth`
- React 19.2 and strict TypeScript 7
- Tailwind CSS 4 in CSS-first mode with ShadCN components
- Bun 1.4.0, pinned by `packageManager`

## Setup

Install the pinned dependency graph and start the local server:

```bash
bun install --frozen-lockfile
bun run dev
```

Open <http://localhost:3000>.

`INVITE_CODE` is a server-only environment variable used by `/api/auth`. Put it in an untracked local environment file or provide it to the server process. Never expose it to client code, logs, or commits. If it is absent, empty, or blank, authentication fails closed with status `503`.

## Verification

```bash
bun run format:check
bun run lint
bun run typecheck
bun run test
bun run build
```

Optionally audit the locked production dependency graph with `bun audit`.

## Architecture and UI contract

The App Router owns the landing-page UI; the Pages API owns `POST /api/auth`. The page intentionally prevents user-visible scrolling with hidden overflow, even though its document geometry may extend vertically. Check viewport behavior and guard against accidental horizontal clipping rather than requiring a literal zero-overflow document. Preserve the public background-video source order so capable browsers choose the best supported asset: AV1 MP4 (`public/assets/bg_av1.mp4`) → WebM (`public/assets/bg.webm`) → fallback MP4 (`public/assets/bg.mp4`).
