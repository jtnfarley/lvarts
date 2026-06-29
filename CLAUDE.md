# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server
npm run build        # prisma generate + next build
npm run lint         # ESLint
npm run cypress:open # Open Cypress e2e test runner
```

After changing the Prisma schema, run `npx prisma generate` before the next build.

## Architecture

**Lehigh Valley Art & Music** is a Next.js 15 App Router social media platform for the local arts community.

### Route structure

- `app/(root)/(profile-required)/` — auth-gated pages (home feed, user profiles, post detail, scene, search, notifications, audio upload, musikfest-scheduler)
- `app/(root)/profile/` — profile setup
- `app/gallery/`, `app/calendar/` — public-facing pages
- `app/api/auth/` — NextAuth route handler
- `app/api/radio/` — AzuraCast webhook endpoint (validates station ID 614)

### Data flow pattern

Server components in `components/` fetch nothing — they call functions from `app/data/` (the DAL layer) and pass results as props to Client components. Mutations go through `app/actions/` server actions.

- `app/data/` — read-only Prisma queries and raw SQL (`Prisma.sql` tagged template)
- `app/actions/` — server actions (post creation/editing, file uploads, user updates, venue search, AI bridge)
- `lib/models/` — TypeScript interfaces (`Post`, `User`, `UserDetails`, `FeedRow`, etc.)
- `lib/utils.ts` — `cn()`, `compressImage()`, `formatDate()`, Lexical JSON parser, word lists for AI prompts

### Key subsystems

**Auth:** NextAuth v5 (JWT strategy) with Prisma adapter. `app/data/currentUser.ts` exports `currentUser()` (redirects if unauthenticated) and `isLoggedIn()` (returns undefined if not logged in).

**File storage:** BunnyCDN (`lvartsmusic-ny` zone, NY region). Images go through `uploadFile()` in `app/actions/fileUploader.ts`. The CDN base URL is `constants/imageUrl.ts` → `https://lvartsmusic-ny.b-cdn.net`. Files are stored at `{userdir}/{filename}` paths.

**Radio:** AzuraCast station 614 at `https://a6.asurahosting.com:6870/radio.mp3`. Audio posts can be submitted to the radio via `ftpFile()` which POSTs to the AzuraCast API. The `RadioServer` → `Tracks` → `RadioClient` chain renders a fixed player at the bottom of every page (above the mobile nav). `RadioServer` passes a `getAudioTrack` server function as a prop to `Tracks` to avoid serialization issues with Prisma results.

**Rich text:** Lexical editor (`@lexical/react`) with `lexical-beautiful-mentions` for `@` mentions. Post content is stored as both sanitized HTML (`content`) and Lexical JSON (`lexical`) in the `posts` table. `parseText()` in `lib/utils.ts` extracts plain text from Lexical JSON.

**AI features:** `app/data/openAI.ts` uses `@anthropic-ai/sdk` (claude-haiku-4-5) for text responses and `openai` SDK (gpt-image-1-mini) for image generation. The "AI-ify" button in `PostForm` rewrites post content in a selected tone via the Anthropic client.

**Post types:** `posttypes` table drives type behavior. Type `audio` triggers `AudioFields` in the form and causes the post to be routed to the radio upload flow. Type names containing "scene" trigger event scheduling fields (venue, date/time).

### Environment variables

| Variable | Purpose |
|---|---|
| `postgresql_DATABASE_URL` | PostgreSQL connection string |
| `BUNNY_KEY` | BunnyCDN storage API key |
| `AZURACAST_API_KEY` | AzuraCast bearer token for radio uploads |
| `ANTHROPIC_API_KEY` | Claude API (text generation) |
| `OPENAI_API_KEY` | OpenAI API (image generation) |
| `AUTH_SECRET` | NextAuth secret |

### Database

PostgreSQL via Prisma. Key relationships:
- `posts` ← `usertoposts` → `userdetails` (many-to-many; first `usertoposts` row is the author)
- `posts` → `audiotracks` (one-to-many; radio metadata)
- `posts` ← `commentstopost` (self-referential comments)
- `userdetails` is 1:1 with `User` and holds the display profile (handle, avatar, userdir, bio)
- `posts.postfile` stores just the filename; full URL is `{imageUrl}/{userdir}/{postfile}`

Many data queries use raw `Prisma.sql` lateral joins for performance (see `app/data/posts.ts`).
