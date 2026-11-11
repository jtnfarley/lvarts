This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Importing events

Venue sites are scraped into snapshots, then the importer turns the snapshots into event posts. See `Event Scraper Spec (Phase 1).md` and `Event Import Spec (Phase 2).md` for the full design.

### Add a venue

1. Write a scraper adapter in `lib/scraper/adapters/` and register it in `lib/scraper/sources.ts`. Add a fixture and a test next to it.
2. Create the venue in the `venues` table (add an event for it through the site, or extend `scripts/seed-calendar.ts`). The importer finds the venue by name, ignoring case.
3. Register the source in `lib/importer/sources.ts` with the venue name. Leave `autoPublish: false` so new events wait for review on `/admin/imports`.

### Run it

Run these from the project root on Node 20 or later. The import scripts use whatever database `.env` points at.

```bash
npm run test:scraper                                # scraper and adapter tests
npm run scrape -- --source=inkwell --no-save        # scrape without saving a snapshot
npm run import-events -- --dry-run --source=inkwell # preview what would be created
npm run import-events -- --source=inkwell           # create the posts
```

The importer reads the latest saved snapshot (`scraper/<source>/latest.json` in Vercel Blob). Snapshots are saved by the daily scrape cron or by **Run now** on `/admin/scraper`, not by `--no-save` runs. New posts are pending until you publish them on `/admin/imports`. The daily cron at `app/api/cron/import-events` runs the import for every registered source, so a deployed source needs no manual run.

### Run against production

`.env` points at the dev database. Node does not override variables that are already set, so set the production URL for one shell session:

```powershell
$env:postgresql_DATABASE_URL = "<production connection string>"
([uri]$env:postgresql_DATABASE_URL).Host   # confirm it is db.prisma.io, not localhost
npm run import-events -- --dry-run --source=inkwell
npm run import-events -- --source=inkwell
Remove-Item Env:postgresql_DATABASE_URL
```

Production needs the calendar account (`npm run seed:calendar`), the venue, and a snapshot saved by the production scraper. The code for a new source must be deployed before `/admin/scraper` and `/admin/imports` list it. Always run the dry run first.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
