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
- `lib/utils.ts` — `cn()`, `compressImage()`, `formatDate()`, Lexical JSON parser, word lists for AI prompts

### Key subsystems

**Auth:** NextAuth v5 (JWT strategy) with Prisma adapter. `app/data/currentUser.ts` exports `currentUser()` (redirects if unauthenticated) and `isLoggedIn()` (returns undefined if not logged in).

**File storage:** BunnyCDN (`lvartsmusic-ny` zone, NY region), CDN base URL `constants/imageUrl.ts` → `https://lvartsmusic-ny.b-cdn.net`. Files are stored at `{userdir}/{filename}` paths. Two upload paths exist:
  - Client-initiated uploads (user posting media) go through `uploadViaWorker()` in `lib/clientUpload.ts`: the client first calls `POST /api/upload-token` to get a 5-minute HMAC-signed token (`UPLOAD_SECRET`), then `PUT`s the file directly to a Cloudflare Worker (`NEXT_PUBLIC_UPLOAD_WORKER_URL`) that forwards it to BunnyCDN. This bypasses Vercel's request body size limit.
  - Server-initiated uploads (AI bot-generated images) use `uploadFile()` in `app/actions/fileUploader.ts`, which `PUT`s directly to BunnyCDN from the server action — fine there since the file never crosses the Vercel body-size limit.

**Radio:** AzuraCast station 614 at `https://a6.asurahosting.com:6870/radio.mp3`. Audio posts are submitted to the radio via `radioUpload()` in `app/actions/fileUploader.ts`, which re-fetches the already-uploaded file from BunnyCDN and forwards it to the AzuraCast API (so audio data never passes through Vercel twice). The `RadioServer` → `Tracks` → `RadioClient` chain renders a fixed player at the bottom of every page (above the mobile nav). `RadioServer` passes a `getAudioTrack` server function as a prop to `Tracks` to avoid serialization issues with Prisma results.

**Rich text:** Lexical editor (`@lexical/react`) with `lexical-beautiful-mentions` for `@` mentions. Post content is stored as both sanitized HTML (`content`) and Lexical JSON (`lexical`) in the `posts` table. `parseText()` in `lib/utils.ts` extracts plain text from Lexical JSON.

**AI features:** `app/data/openAI.ts` uses `@anthropic-ai/sdk` (claude-haiku-4-5) for text responses and `openai` SDK (gpt-image-1-mini) for image generation. The "AI-ify" button in `PostForm` rewrites post content in a selected tone via the Anthropic client.

**AI persona bots:** `lib/bots/` (`hd.ts`, `imageBot.ts`, `musikfestBot.ts`) generate auto-reply posts (`posttype: 'comment'`) as fictional personas — e.g. mentioning reserved `userdetailsid` 12 ("H. D.", a poet bot) or 13/14 (painter bots that call `getImageResponse`) in post content. `notifyMentionedUsers()` in `app/data/postMentions.ts` special-cases those IDs and dispatches the bot instead of creating a normal mention notification. Bot calls must be wrapped in `after()` from `next/server`, not `.then()` — fire-and-forget promises get killed when the serverless function returns before the Anthropic/OpenAI call completes.

**Support chat:** `components/SupportChat/SupportChatServer.tsx` (gated by `isLoggedIn()`) renders a client-side floating widget site-wide for logged-in users only. `sendSupportMessage()` in `app/actions/supportChat.ts` sends the (ephemeral, client-held) conversation to Claude via `getTextResponse()` at `temperature: 0`, grounded in the hand-maintained `SUPPORT_KNOWLEDGE` block (`lib/supportKnowledge.ts`) so it doesn't invent UI details — update that file when the actual posting/upload flows change. It emails an admin alert via `sendAdminAlert()` in `lib/mail.ts` when the reply is tagged `STATUS: issue` (a bug report) or `STATUS: unknown` (a question the knowledge block doesn't cover) — only `STATUS: resolved` skips the alert. No chat history or ticket data is persisted server-side.

**Post types:** `posttypes` table drives type behavior. `PostForm` checks `posttype === 'audio'` to show `AudioFields` and route to the radio upload flow, and `posttype === 'event'` to show `EventFields` (venue/date-time scheduling, via `useVenueSearch`).

**Boosting:** Post authors can pay to bypass the follow-graph feed scope, priced CPM-style (pay per 1,000 impressions). `BoostPost` (in `components/PostUi/`, rendered from `PostActions` next to Edit/Delete, hidden for private posts) opens `BoostCheckoutModal`, a self-contained step machine (select an impressions tier → Stripe `<PaymentElement>` → success/error) that intentionally bypasses the shared `ModalContext`/`ModalRoot` system, since that context is built for single synchronous confirm actions, not an async multi-step payment flow. Impression tiers live in `constants/boost.ts` ($1/1,000 flat rate) — the client only ever sends a tier key, never a raw amount; `createBoostPaymentIntent` (`app/actions/boost.ts` → `app/data/boosts.ts`) resolves the real charge amount server-side and re-validates post ownership/privacy before creating a Stripe PaymentIntent. The `postboosts` row is only ever written by the `app/api/webhooks/stripe/` handler on `payment_intent.succeeded` (never at checkout time), keyed idempotently on `stripepaymentintentid`, storing `impressionspurchased` and a fixed `expiresat` backstop (`activatedat + BOOST_BACKSTOP_DAYS`, currently 30 days) so a slow boost still turns off eventually even if it never exhausts its purchased impressions. A boost is "active" (`activeBoostPredicate` in `lib/boostQueries.ts` — kept out of the `'use server'` DAL files since Next requires every export of a `'use server'` file to be an async function, and this is a plain SQL-fragment helper — shared between the feed query and the `isboosted` flag) only while `status = 'active' AND expiresat > now() AND` its impressions aren't exhausted — impressions-remaining is computed as a live `COUNT` against the `postboostimpressions` ledger table rather than a stored counter, to avoid a second source of truth drifting under concurrent writes. Each row in that ledger is one unique `(postboostid, userdetailsid)` pair — the unique constraint is both the dedup mechanism and the idempotency guard. Impressions are only recorded for the home feed: `PostUi` takes an opt-in `trackImpressions` prop (set only by `Feed.tsx`, not by `Search.tsx`/`SinglePost.tsx`/`CommentFeed.tsx`, and Gallery never renders `PostUi` at all), using `useInView` from `react-intersection-observer` to fire `recordBoostImpression` once a boosted post actually scrolls into view — client-side `triggerOnce` reduces call volume but the DB unique constraint, not the hook, is what makes repeated fires across remounts/polling harmless. `getFeedRow` in `app/data/posts.ts` takes an `includeBoosted` parameter (default `false`) that unions currently-active boosts into `eligible_posts` (independent of the `lastChecked` freshness filter and the follow/like scope, by design) only when explicitly passed `true` — only `Feed.tsx`'s calls (the home feed) do this; the user-profile page (`app/(root)/(profile-required)/user/[handle]/page.tsx`, which reuses the same `getFeedRow` to render a profile's own post history) deliberately leaves it `false` so unrelated boosted posts don't leak into someone's profile. `feedRowSelect` exposes the `isboosted` flag (consumed everywhere a post renders, not just the home feed) that drives the `BoostedBadge` shown in `PostHeader` — once a boost is exhausted, both the injection and the badge stop, though an organically-visible post is unaffected. No audience/demographic targeting exists — a boosted post's impressions can go to anyone who sees the home feed.

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
| `STRIPE_SECRET_KEY` | Stripe secret API key (server-side PaymentIntent creation + webhook processing) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (client-side Elements/Payment Element) |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for the `app/api/webhooks/stripe` endpoint |

### Database

PostgreSQL via Prisma. Key relationships:
- `posts` ← `usertoposts` → `userdetails` (many-to-many; first `usertoposts` row is the author)
- `posts` → `audiotracks` (one-to-many; radio metadata)
- `posts` ← `commentstopost` (self-referential comments)
- `userdetails` is 1:1 with `User` and holds the display profile (handle, avatar, userdir, bio)
- `posts.postfile` stores just the filename; full URL is `{imageUrl}/{userdir}/{postfile}`

Many data queries use raw `Prisma.sql` lateral joins for performance (see `app/data/posts.ts`).
