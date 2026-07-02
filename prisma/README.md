# Prisma workflow

## Schema changes

Production and dev drifted out of sync in the past because schema changes
were applied by hand directly against production. Migration history is now
baselined against the real, current schema (`20260702101520_baseline_2026_07_02`)
— keep it that way:

1. Edit `prisma/schema.prisma`.
2. `npx prisma migrate dev --name <change-description>` — applies it to your
   local dev database and generates a migration file.
3. Commit the migration folder along with your code change and push to `main`.
4. `.github/workflows/prisma-migrate.yml` automatically runs
   `prisma migrate deploy` against production whenever `prisma/migrations/**`
   changes on `main` — no manual deploy step needed. It uses the
   `PROD_DATABASE_URL` repo secret (Settings → Secrets and variables →
   Actions). Note there's no explicit ordering with Vercel's own git-triggered
   deploy, so for changes where app code strictly requires the new schema to
   already exist, land the migration a beat ahead of the code (e.g. merge the
   migration first, deploy the code after) or watch both runs.

Never run `ALTER TABLE`/manual DDL directly against production — it's exactly
what caused the drift this baseline fixed (see git history around
2026-07-02 for specifics: a missing `VerificationToken` table, a broken
`Account` primary key, and a dropped `posts.isgalleryfile` default that had
been silently nulling most posts).

## Syncing dev data from production

`scripts/sync-dev-db.ps1` mirrors production's schema + data into your local
`lvarts` database using a throwaway Dockerized `postgres:17` client (no local
Postgres tools required). Your existing local db is renamed, not dropped.

```powershell
$env:PROD_DATABASE_URL = "postgres://...@db.prisma.io:5432/postgres?sslmode=require"
./scripts/sync-dev-db.ps1
```

After syncing, run `npx prisma db pull` and diff against git to check for any
new drift before trusting the schema.
