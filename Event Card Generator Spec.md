# Event Card Generator Spec

Oct 22, 2026 · @John Farley

## Goal and scope

Build a generator that turns lvartandmusic.com events into branded 1080×1350 JPEG cards for Instagram, plus a roundup cover card for daily and weekend carousels, viewable in an admin preview page.

This is phase 1 of an Instagram auto-posting pipeline. The cards must be usable today for manual posting, and reusable later by an automated publisher.

**In scope**

- One card per event, 1080×1350 JPEG (4:5 portrait).
- A roundup cover card for the first slide of a carousel, with two presets: "What's Happening Today" (daily) and "This Weekend in the Valley" (weekend), plus custom date ranges.
- Public routes that return each card as a JPEG.
- An admin-only preview page showing any roundup's cover plus event cards, with download links.

**Out of scope for this phase**

- Instagram API calls, tokens, or publishing.
- Uploading to Vercel Blob or any storage.
- Database migrations. Work only with the existing schema.
- Story-format (1080×1920) cards. Structure the code so a story variant can be added later.

## Data mapping

An event is an `events` row plus its linked `posts` (via `posts.eventid`). Normalize everything into one `CardEvent` object before rendering, so templates never touch Prisma models directly.

| Card field | Source | Notes |
| --- | --- | --- |
| Event ID | `events.id` | Route parameter |
| Title | `events.eventname` | If null, fall back to the first line of the primary post's `content` (HTML stripped). If both are empty, the event is not renderable. |
| Date and time | `events.eventdate` | Timestamptz. Always format in `America/New_York`. |
| Venue name | `events.venues.venuename` | Optional; omit the line if no venue. |
| Town | `events.venues.cities.city` | Optional; shown as "Venue · Town". |
| Description snippet | Primary post `content` | HTML stripped, whitespace collapsed, up to \~140 characters. Optional. |
| Image | Primary post `postfile` | Only when the post's `filetypes.filetype` is an image type. |
| Event URL | Site event page | Shown as text in the footer, e.g. lvartandmusic.com/... Confirm the real event page path in the codebase. |

**Primary post rule:** among posts with this `eventid`, ignore posts where `privatepost = true`. Pick the earliest by `createdat`. For the image, use the first eligible post (same ordering) that has an image `postfile`.

**Exclusions:** an event with no non-private posts returns 404 from the card route and is skipped in the weekend set.

**Fields that don't exist yet:** there is no category, end time, price, age limit, lineup, cancellation flag, or venue Instagram handle in the schema. Do not add them in this phase. The template should be written so these could be added later as optional lines.

## Card designs

Both cards are 1080×1350 with a 64px safe margin on all sides. Instagram's grid crops feed posts toward the center, so nothing essential goes in the outer 64px.

**Event card, with image**

1. **Image panel, top \~60% (about 810px tall):** the post image shown whole with `contain` sizing (posters often carry their own text, so never crop them). Fill the empty space behind it with a blurred, darkened copy of the same image scaled to `cover`.
2. **Info panel, bottom \~40%, cream background:**
   - Date line in orange caps, e.g. `FRI OCT 24 · 8:00 PM`.
   - Title in the display font, large, up to 3 lines.
   - `Venue · Town` in the body font.
3. **Footer strip, orange:** the small logo on the left, `lvartandmusic.com` on the right.

**Event card, no image**

A typographic version, orange background with a large cream panel. Same content order as above, but the title can be much larger, and the description snippet appears under the venue line. A faint Pennsylvania-outline or star motif from the logo can fill empty space.

**Roundup cover card**

One template with a headline and date line passed in, so daily, weekend, and future presets share the same design.

- Orange background, full logo near the top.
- Headline in the display font: "What's Happening Today" (daily) or "This Weekend in the Valley" (weekend).
- Date line: `THU OCT 22` for daily, `OCT 24–26` for weekend.
- Count line, e.g. "6 shows and openings · swipe →".
- If more events exist than are shown, add "+ 4 more at lvartandmusic.com".
- A small visual difference between presets (for example, the star accent placement or a day-of-week stamp on daily covers) so followers can tell a daily post from a weekend one in the grid.

A carousel holds at most 10 images, so any roundup is the cover plus up to 9 event cards. Daily and weekend roundups will overlap on Fridays through Sundays; deciding which to post on those days belongs to the publishing phase, not this one.

## Branding

The palette and display font come from the existing logo: an orange field, a cream Pennsylvania shape, a yellow star, and distressed typewriter lettering.

| Token | Value (approximate) | Use |
| --- | --- | --- |
| `orange` | `#F7941D` | Backgrounds, footer strip, date line |
| `cream` | `#FEF9E6` | Info panel, text on orange |
| `ink` | `#2B2118` | Body text on cream |
| `star` | `#FFE11A` | Small accents only |
| Display font | Special Elite (Google Fonts, OFL) | Titles and cover headline |
| Body font | Courier Prime or a clean sans such as Archivo (Google Fonts, OFL) | Date, venue, description |

The hex values are estimated by eye. Sample the exact colors from the logo file and update the tokens.

**Logo:** place the logo PNG at `public/brand/logo.png` (the owner will supply it). Load it from disk at render time, not over HTTP. Put all tokens in one `theme.ts` so the palette can be changed in one place.

## Rendering pipeline

Render with `ImageResponse` from `next/og`, then convert the PNG to JPEG with `sharp`. All card code runs on the Node runtime (`export const runtime = 'nodejs'`), because `sharp` and filesystem font loading don't work on Edge.

1. **Load data:** fetch the event with its venue, city, and posts (with `filetypes`) in one Prisma query, then build a `CardEvent`.
2. **Prepare the image (if any):** resolve `postfile` to a fetchable URL or file, fetch it, and use `sharp` to (a) make a fitted version of the image for the `contain` panel and (b) a small blurred version for the backdrop. Pass both to the template as PNG or JPEG data URLs. Normalizing here avoids format problems (for example WebP or HEIC uploads) inside `ImageResponse`.
3. **Render:** call the template component inside `new ImageResponse(<Card />, { width: 1080, height: 1350, fonts })`.
4. **Convert:** read the PNG buffer and run `sharp(png).flatten({ background: cream }).jpeg({ quality: 90, mozjpeg: true })`. Instagram's API accepts JPEG only, and files must stay under 8 MB.
5. **Respond:** return the JPEG with `Content-Type: image/jpeg` and a cache header.

**Font loading:** `ImageResponse` needs font data passed in explicitly. Commit TTF files to `assets/fonts/` and read them with `fs.readFile`. Cache the buffers at module level so they're read once per instance.

**Template constraints (Satori):** layout is flexbox only, and any `div` with more than one child needs `display: 'flex'`. No CSS grid, no external stylesheets, no `className` styling. Keep all styles inline.

**Image fetch failures:** if the image can't be fetched or decoded, log it and fall back to the no-image layout. A card should never fail because of a bad image.

**Caching:** use `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`. Card content changes when posts are edited, so don't cache indefinitely. Optionally add an `ETag` built from the event ID and the latest post `updatedat`.

## Routes and admin preview

| Route | Returns | Access |
| --- | --- | --- |
| `GET /api/cards/event/[id]` | JPEG card for one event; 404 if not renderable | Public |
| `GET /api/cards/roundup?preset=today` | JPEG cover card for today's events; 404 if there are none | Public |
| `GET /api/cards/roundup?preset=weekend` | JPEG cover card for the current or upcoming weekend | Public |
| `GET /api/cards/roundup?preset=today&date=YYYY-MM-DD` | Daily cover for a specific date (for previewing tomorrow) | Public |
| `GET /api/cards/roundup?start=YYYY-MM-DD&end=YYYY-MM-DD` | Cover card for a custom range, with a generic headline | Public |
| `/admin/cards` | Preview page | Admin only |

The card routes are public on purpose: they only show public post content, and the same event card can later be used as the Open Graph image for event pages, so shared links show a branded preview.

**Roundup windows (all in `America/New_York`):**

- **Today:** 00:00 through 23:59:59 on the given date (default: the current Eastern date, not the server's UTC date).
- **Weekend:** Friday 00:00 through Sunday 23:59:59. Monday through Thursday, use the upcoming weekend; Friday through Sunday, use the current weekend.
- **Custom:** inclusive start and end dates.

In every case, sort events by `eventdate` ascending and take the first 9. Implement this as one function, `getRoundup({ preset, date, start, end })`, that returns the window, headline, date label, the events to show, and the skipped events with reasons. Adding a future preset (for example "This Week") should only mean adding a case to that function.

**Preview page (`/admin/cards`):**

- Tabs or buttons for **Today**, **Tomorrow**, and **This Weekend**, plus a custom date range.
- Shows the cover card followed by each event card in carousel order, at roughly 360px wide.
- Each card has a "Download JPEG" link and its event ID.
- A short list of events in the window that were skipped and why (no title, private only, over the limit of 9).
- A clear "No events" state for empty days instead of a broken cover.

**Admin auth:** the schema has no admin role. Gate the page with the existing NextAuth session and an `ADMIN_EMAILS` environment variable (comma-separated). Non-admins get a 404, not a login prompt.

## Text rules and edge cases

Satori can't measure text before layout, so title sizing uses character-count tiers. Tune the numbers against real rendered output.

| Title length | Font size (with image) | Font size (no image) |
| --- | --- | --- |
| Up to 30 characters | 72px | 104px |
| 31–60 | 58px | 84px |
| 61–90 | 48px | 68px |
| Over 90 | 48px, truncated at a word boundary near 100 characters with "…" | 68px, same truncation |

- Put all text helpers (tiering, truncation, HTML stripping, date formatting) in one module with unit tests.
- Strip HTML tags and decode entities from post `content`. Collapse whitespace.
- Strip emoji from titles and snippets unless an emoji font is loaded. Missing glyphs render as boxes.

**Edge cases**

- **Missing time:** if `eventdate` is exactly 00:00 Eastern, treat it as date-only and show `FRI OCT 24` with no time. Confirm this matches how dates are entered on the site.
- **Null `eventdate`:** show "Date TBA" on the single-card route; exclude from weekend sets.
- **No venue:** omit the venue line entirely; don't show "Unknown venue".
- **Past events:** the single-card route still renders them; weekend sets only include events in the window.
- **Long venue names:** truncate at about 40 characters.
- **Image too small:** if the source image is under 600px wide, use the no-image layout rather than showing a blurry upscale.
- **Non-image postfile** (audio, video): ignore it and use the next eligible image post, or the no-image layout.

## Files to create

Adjust paths to the project's existing conventions (for example, if it uses `src/` or a different `lib` folder).

| Path | Purpose |
| --- | --- |
| `lib/cards/theme.ts` | Colors, sizes, margins, font names |
| `lib/cards/fonts.ts` | Loads and caches TTF buffers from `assets/fonts/` |
| `lib/cards/getCardEvent.ts` | Prisma query + normalization into `CardEvent`; primary post and image selection |
| `lib/cards/getRoundup.ts` | Preset windows (today, weekend, custom), headline and date label, sorting, limit of 9, skipped-event reasons |
| `lib/cards/text.ts` | Title tiers, truncation, HTML stripping, emoji removal, Eastern date formatting |
| `lib/cards/prepareImage.ts` | Fetches `postfile`, builds fitted and blurred data URLs with `sharp` |
| `lib/cards/templates/EventCard.tsx` | Event card JSX, with and without image |
| `lib/cards/templates/RoundupCover.tsx` | Cover card JSX, driven by headline, date label, and counts |
| `lib/cards/render.ts` | `renderEventCard(id)` and `renderRoundupCover(options)` returning JPEG `Buffer`s; the functions the publisher will call later |
| `app/api/cards/event/[id]/route.ts` | Event card route |
| `app/api/cards/roundup/route.ts` | Cover card route |
| `app/admin/cards/page.tsx` | Admin preview page |
| `lib/auth/isAdmin.ts` | Session + `ADMIN_EMAILS` check (reuse if something similar exists) |
| `assets/fonts/*.ttf` | Display and body fonts |
| `public/brand/logo.png` | Logo (supplied by owner) |

Add `sharp` as a dependency if it isn't already installed. Add `ADMIN_EMAILS` to `.env.example`.

## Acceptance criteria and testing

The phase is done when every box below is checked.

- [ ] `/api/cards/event/[id]` returns a valid 1080×1350 JPEG under 8 MB for a real event, verified with `sharp(...).metadata()`.
- [ ] Cards render correctly with an image, without an image, and with a broken image URL (falls back cleanly).
- [ ] A private-only event returns 404 and is listed as skipped on the preview page.
- [ ] Times display in Eastern, including across the daylight saving change (test an event on Nov 1 and Nov 8, 2026).
- [ ] The daily window uses the Eastern date: at 11:30 PM Eastern (already the next day in UTC), "today" still means the Eastern date.
- [ ] The weekend window is correct when run on a Wednesday, a Saturday, and a Sunday night.
- [ ] A day with zero events returns 404 from the roundup route and shows the empty state on the preview page.
- [ ] Covers show the right count and the "+ N more" line when there are more than 9 events.
- [ ] Unit tests cover `text.ts` and every preset in `getRoundup.ts`.
- [ ] A fixture script renders sample cards to a local folder for visual review: a 10-character title, a 120-character title, a title with emoji, no venue, no time, a tall poster image, a wide photo, and both cover presets.
- [ ] `/admin/cards` returns 404 for a logged-out user and a non-admin user.
- [ ] Works in a Vercel preview deployment, not only locally (`sharp` and font files must be included in the function bundle).

## Notes for Claude Code

Before writing code, check these in the codebase and adjust the plan rather than guessing.

1. **How `postfile` becomes a URL.** It may be a full URL, a storage key, or a path combined with `userdetails.userdir`. Find the existing helper that renders post images and reuse it.
2. **The values in `filetypes.filetype`.** Confirm which strings mean an image.
3. **What's in `posts.content`.** Check whether it's plain text or HTML (the `lexical` column suggests a Lexical editor), and strip accordingly.
4. **The public event page URL** for the footer text.
5. **How dates are entered.** Confirm whether a 00:00 Eastern time really means "no time given."
6. **The NextAuth setup and Prisma client import,** so the admin check and queries follow existing patterns. Note the env var is `postgresql_DATABASE_URL`.
7. **Next.js version.** Confirm `next/og` is available and how route `params` are typed in this version.

Work in small steps: data layer and text helpers with tests first, then the no-image card, then the image card, then the cover, then the preview page. Show rendered output after each card template so the owner can react to the design early.
