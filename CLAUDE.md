# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server
npm run build        # prisma generate + next build
npm run lint         # ESLint
npm run cypress:open # Open Cypress e2e test runner
npx cypress run --spec cypress/e2e/app.cy.ts  # Run a single e2e spec headlessly
```

After changing the Prisma schema, run `npx prisma generate` before the next build.

The `worker/` directory is a separate npm project (its own `package.json`, not part of the root workspace) containing the Cloudflare Worker source referenced below under File storage:

```bash
cd worker && npm run dev     # wrangler dev — local worker, reads worker/.dev.vars
cd worker && npm run deploy  # wrangler deploy
```

Worker secrets (`BUNNY_KEY`, `UPLOAD_SECRET`) are set via `wrangler secret put <NAME>`, not in `wrangler.toml`.

## Architecture

**Lehigh Valley Art & Music** is a Next.js 15 App Router social media platform for the local arts community.

### Route structure

- `app/(root)/(profile-required)/` — auth-gated pages (home feed, user profiles, post detail, search, notifications, audio upload, musikfest-scheduler)
- `app/(root)/profile/` — profile setup
- `app/gallery/`, `app/calendar/` (+ `add-event`) — public-facing pages
- `app/api/auth/` — NextAuth route handler
- `app/api/radio/` — AzuraCast webhook endpoint (validates station ID 614)
- `app/api/upload-token/` — issues short-lived HMAC tokens for direct-to-worker uploads (see File storage below)
- `app/api/webhooks/stripe/` — Stripe webhook endpoint, activates boosts on `payment_intent.succeeded` (see Boosting below)

### Data flow pattern

Server components in `components/` fetch nothing — they call functions from `app/data/` (the DAL layer) and pass results as props to Client components. Mutations go through `app/actions/` server actions.

- `app/data/` — read-only Prisma queries and raw SQL (`Prisma.sql` tagged template)
- `app/actions/` — server actions (post creation/editing, file uploads, user updates, venue search, AI bridge)
- `lib/models/` — TypeScript interfaces (`Post`, `User`, `UserDetails`, `FeedRow`, etc.)

**Every export of a `'use server'` file is a public endpoint any browser can call with any arguments** — including `app/data/*` helpers, not just `app/actions/*`. So an exported action must never trust a user id, author, or folder from its arguments: take the acting user from the session (`isLoggedIn()` / `currentUser()`), and check ownership before changing anything (`lib/auth/canModifyPost.ts`, `lib/auth/canUploadToUserdir.ts`; admins via `isAdmin()`). Code that runs without a user session (the AI bots, the event importer) and therefore must name the author itself lives in plain modules, not `'use server'` files: `saveTrustedPost` (`lib/posts/savePost.ts`), `likePostDAL`/`unlikePostDAL` (`lib/posts/likes.ts`), `uploadFile` (`lib/bunny.ts`), `getTextResponse`/`getImageResponse` (`lib/ai.ts`). The public `savePost` in `app/data/posts.ts` is the guarded wrapper around `saveTrustedPost`.
- `lib/utils.ts` — `cn()`, `compressImage()`, `formatDate()`, Lexical JSON parser, word lists for AI prompts

### Key subsystems

**Auth:** NextAuth v5 (JWT strategy) with Prisma adapter. `app/data/currentUser.ts` exports `currentUser()` (redirects if unauthenticated) and `isLoggedIn()` (returns undefined if not logged in).

**File storage:** BunnyCDN (`lvartsmusic-ny` zone, NY region), CDN base URL `constants/imageUrl.ts` → `https://lvartsmusic-ny.b-cdn.net`. Files are stored at `{userdir}/{filename}` paths. Two upload paths exist:
  - Client-initiated uploads (user posting media) go through `uploadViaWorker()` in `lib/clientUpload.ts`: the client first calls `POST /api/upload-token` to get a 5-minute HMAC-signed token (`UPLOAD_SECRET`), then `PUT`s the file directly to a Cloudflare Worker (`NEXT_PUBLIC_UPLOAD_WORKER_URL`) that forwards it to BunnyCDN. This bypasses Vercel's request body size limit.
  - Server-initiated uploads (AI bot-generated images) use `uploadFile()` in `lib/bunny.ts` (a trusted server-only helper, see below), which `PUT`s directly to BunnyCDN — fine there since the file never crosses the Vercel body-size limit.

**Radio:** AzuraCast station 614 at `https://a6.asurahosting.com:6870/radio.mp3`. Audio posts are submitted to the radio via `radioUpload()` in `app/actions/fileUploader.ts`, which re-fetches the already-uploaded file from BunnyCDN and forwards it to the AzuraCast API (so audio data never passes through Vercel twice). The `RadioServer` → `Tracks` → `RadioClient` chain renders a fixed player at the bottom of every page (above the mobile nav). `RadioServer` passes a `getAudioTrack` server function as a prop to `Tracks` to avoid serialization issues with Prisma results.

**Rich text:** Lexical editor (`@lexical/react`) with `lexical-beautiful-mentions` for `@` mentions. Post content is stored as both sanitized HTML (`content`) and Lexical JSON (`lexical`) in the `posts` table. `parseText()` in `lib/utils.ts` extracts plain text from Lexical JSON.

**AI features:** `lib/ai.ts` (a trusted server-only module, not an endpoint) uses `@anthropic-ai/sdk` (claude-haiku-4-5) for text responses and `openai` SDK (gpt-image-1-mini) for image generation. The "AI-ify" button in `PostForm` rewrites post content in a selected tone through the `aiIfyPost` action (`app/actions/openAIBridge.ts`), which requires a login, accepts only a known tone, caps the text, and builds the prompt on the server so it can't be used as a free general-purpose chat.

**AI persona bots:** `lib/bots/` (`hd.ts`, `imageBot.ts`, `musikfestBot.ts`) generate auto-reply posts (`posttype: 'comment'`) as fictional personas — e.g. mentioning reserved `userdetailsid` 12 ("H. D.", a poet bot) or 13/14 (painter bots that call `getImageResponse`) in post content. `notifyMentionedUsers()` in `app/data/postMentions.ts` special-cases those IDs and dispatches the bot instead of creating a normal mention notification. Bot calls must be wrapped in `after()` from `next/server`, not `.then()` — fire-and-forget promises get killed when the serverless function returns before the Anthropic/OpenAI call completes.

**Support chat:** `components/SupportChat/SupportChatServer.tsx` (gated by `isLoggedIn()`) renders a client-side floating widget site-wide for logged-in users only. `sendSupportMessage()` in `app/actions/supportChat.ts` sends the (ephemeral, client-held) conversation to Claude via `getTextResponse()` at `temperature: 0`, grounded in the hand-maintained `SUPPORT_KNOWLEDGE` block (`lib/supportKnowledge.ts`) so it doesn't invent UI details — update that file when the actual posting/upload flows change. It emails an admin alert via `sendAdminAlert()` in `lib/mail.ts` when the reply is tagged `STATUS: issue` (a bug report) or `STATUS: unknown` (a question the knowledge block doesn't cover) — only `STATUS: resolved` skips the alert. No chat history or ticket data is persisted server-side.

**Post types:** `posttypes` table drives type behavior. `PostForm` checks `posttype === 'audio'` to show `AudioFields` and route to the radio upload flow, and `posttype === 'event'` to show `EventFields` (venue/date-time scheduling, via `useVenueSearch`).

**Boosting:** Post authors can pay to bypass the follow-graph feed scope, priced CPM-style (pay per 1,000 impressions). `BoostPost` (in `components/PostUi/`, rendered from `PostActions` next to Edit/Delete, hidden for private posts) opens `BoostCheckoutModal`, a self-contained step machine (select an impressions tier → Stripe `<PaymentElement>` → success/error) that intentionally bypasses the shared `ModalContext`/`ModalRoot` system, since that context is built for single synchronous confirm actions, not an async multi-step payment flow. Impression tiers live in `constants/boost.ts` ($1/1,000 flat rate) — the client only ever sends a tier key, never a raw amount; `createBoostPaymentIntent` (`app/actions/boost.ts` → `app/data/boosts.ts`) resolves the real charge amount server-side and re-validates post ownership/privacy before creating a Stripe PaymentIntent. The `postboosts` row is only ever written by the `app/api/webhooks/stripe/` handler on `payment_intent.succeeded` (never at checkout time), keyed idempotently on `stripepaymentintentid`, storing `impressionspurchased` and a fixed `expiresat` backstop (`activatedat + BOOST_BACKSTOP_DAYS`, currently 30 days) so a slow boost still turns off eventually even if it never exhausts its purchased impressions. A boost is "active" (`activeBoostPredicate` in `lib/boostQueries.ts` — kept out of the `'use server'` DAL files since Next requires every export of a `'use server'` file to be an async function, and this is a plain SQL-fragment helper — shared between the feed query and the `isboosted` flag) only while `status = 'active' AND expiresat > now() AND` its impressions aren't exhausted — impressions-remaining is computed as a live `COUNT` against the `postboostimpressions` ledger table rather than a stored counter, to avoid a second source of truth drifting under concurrent writes. Each row in that ledger is one unique `(postboostid, userdetailsid)` pair — the unique constraint is both the dedup mechanism and the idempotency guard. Impressions are only recorded for the home feed: `PostUi` takes an opt-in `trackImpressions` prop (set only by `Feed.tsx`, not by `Search.tsx`/`SinglePost.tsx`/`CommentFeed.tsx`, and Gallery never renders `PostUi` at all), using `useInView` from `react-intersection-observer` to fire `recordBoostImpression` once a boosted post actually scrolls into view — client-side `triggerOnce` reduces call volume but the DB unique constraint, not the hook, is what makes repeated fires across remounts/polling harmless. `getFeedRow` in `app/data/posts.ts` takes an `includeBoosted` parameter (default `false`) that unions currently-active boosts into `eligible_posts` (independent of the `lastChecked` freshness filter and the follow/like scope, by design) only when explicitly passed `true` — only `Feed.tsx`'s calls (the home feed) do this; the user-profile page (`app/(root)/(profile-required)/user/[handle]/page.tsx`, which reuses the same `getFeedRow` to render a profile's own post history) deliberately leaves it `false` so unrelated boosted posts don't leak into someone's profile. `feedRowSelect` exposes the `isboosted` flag (consumed everywhere a post renders, not just the home feed) that drives the `BoostedBadge` shown in `PostHeader` — once a boost is exhausted, both the injection and the badge stop, though an organically-visible post is unaffected. No audience/demographic targeting exists — a boosted post's impressions can go to anyone who sees the home feed.

**Event scraper (phase 1, dry-run only):** `lib/scraper/` scrapes venue sites (currently Godfrey Daniels, HTML parsing — its `/wp-json/` is locked) via `SourceAdapter`s registered in `sources.ts`, and writes JSON snapshots + diffs to a private Vercel Blob store (`scraper/<source>/<timestamp>.json`, `latest.json`, `scraper/index.json`). It never touches Prisma/Postgres. Daily Vercel Cron (`vercel.json`) hits `app/api/cron/scrape` (Bearer `CRON_SECRET`); `/admin/scraper` (ADMIN_EMAILS) reviews runs and has a Run now button. CLI: `npm run scrape -- --source=godfrey --no-save`; tests: `npm run test:scraper` (fixtures in `lib/scraper/__fixtures__/`). Spec: `Event Scraper Spec (Phase 1).md`.

**Event importer (phase 2):** `lib/importer/` turns the scraper's `latest.json` snapshots into event posts authored by the "LV Art & Music Calendar" account (`calendar@lvartandmusic.com`, created by `npm run seed:calendar`). The sync rules live in `sync.ts` (pure planning + apply); posts are created through `savePost`, and images are re-hosted via `uploadFile`. Posts are pending (`privatepost = true`) until published on `/admin/imports`; rejecting sets the `event_import_rejected` post type. The importer recognizes its posts by the last content line `More info and tickets: <url>` plus the Eastern date, and treats `edited = true` as an admin edit it must not overwrite. `privatepost` posts are hidden from every feed query in `app/data/posts.ts` (only admins can open one via `getPost`). Per-source `autoPublish` is in `lib/importer/sources.ts`; `IMPORT_AUTO_PUBLISH=off` overrides it. CLI: `npm run import-events -- --dry-run`; tests: `npm run test:importer`. Spec: `Event Import Spec (Phase 2).md`.

**User blocking:** `blockUser`/`unblockUser` (`app/actions/blocks.ts`, blocker taken from the session) write the `userblocks` table and drop follows in both directions. Blocking is one-way hiding: the blocker no longer sees the blocked user's posts, because `authorDetailsJoin` in `app/data/posts.ts` filters the author through `notBlockedByViewer` (`lib/blocks.ts`) for every feed query, with the viewer read from the session, not an argument. The blocker also gets no notification list entries, unread badge or push from them (`getNotifications`, `Nav`, `pushPostActivity`), and `followUserDAL` refuses when either side blocked the other. The blocked user can still view the blocker's public posts. Entry point is `BlockButton` on other users' profile cards only; the list with Unblock lives at `/settings`.

### Environment variables

| Variable | Purpose |
|---|---|
| `postgresql_DATABASE_URL` | PostgreSQL connection string |
| `BUNNY_KEY` | BunnyCDN storage API key |
| `AZURACAST_API_KEY` | AzuraCast bearer token for radio uploads |
| `ANTHROPIC_API_KEY` | Claude API (text generation) |
| `OPENAI_API_KEY` | OpenAI API (image generation) |
| `AUTH_SECRET` | NextAuth secret |
| `UPLOAD_SECRET` | HMAC secret shared with the upload Worker for signing/verifying upload tokens |
| `NEXT_PUBLIC_UPLOAD_WORKER_URL` | Cloudflare Worker URL that proxies client uploads to BunnyCDN |
| `GOOGLE_MAPS` | Google Maps API key (venue/event location display) |
| `EMAIL_SERVER`, `EMAIL_FROM` | NextAuth email provider (magic link sign-in); also reused by `lib/mail.ts` for admin alerts |
| `SUPPORT_ALERT_EMAIL` | Destination inbox for support-chat technical-issue alerts |
| `ADMIN_EMAILS` | Comma-separated emails allowed to view anything under `/admin` (`app/admin/layout.tsx` gates it and renders the sub-nav; `/admin` is a plain-link dashboard; add new tools to `app/admin/adminTools.ts`) |
| `STRIPE_SECRET_KEY` | Stripe secret API key (server-side PaymentIntent creation + webhook processing) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (client-side Elements/Payment Element) |
| `CRON_SECRET` | Bearer token Vercel Cron sends to `/api/cron/scrape` |
| `IMPORT_AUTO_PUBLISH` | Set to `off` to stop all sources from auto-publishing imported events |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob (private store) token for scraper snapshots |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for the `app/api/webhooks/stripe` endpoint |

### Database

PostgreSQL via Prisma. Key relationships:
- `posts` ← `usertoposts` → `userdetails` (many-to-many; first `usertoposts` row is the author)
- `posts` → `audiotracks` (one-to-many; radio metadata)
- `posts` ← `commentstopost` (self-referential comments)
- `userdetails` is 1:1 with `User` and holds the display profile (handle, avatar, userdir, bio)
- `posts.postfile` stores just the filename; full URL is `{imageUrl}/{userdir}/{postfile}`

Many data queries use raw `Prisma.sql` lateral joins for performance (see `app/data/posts.ts`).
