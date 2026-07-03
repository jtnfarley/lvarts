<#
Mirrors production Postgres (schema + data) into the local dev database.
Uses a throwaway postgres:17 Docker container for pg_dump/pg_restore so
no Postgres client tools need to be installed on the host.

Usage:
  $env:PROD_DATABASE_URL = "postgres://...@db.prisma.io:5432/postgres?sslmode=require"
  ./scripts/sync-dev-db.ps1

Requires Docker Desktop running. The existing local `lvarts` database is
renamed to `lvarts_pre_sync_backup_<timestamp>` rather than dropped.
#>

$ErrorActionPreference = "Stop"

if (-not $env:PROD_DATABASE_URL) {
    throw "Set `$env:PROD_DATABASE_URL to the production connection string first."
}

$DevDbName = "lvarts"
$DevAdminUrl = "postgres://postgres:nola1117@host.docker.internal:5432/postgres"
$DevTargetUrl = "postgres://postgres:nola1117@host.docker.internal:5432/$DevDbName"
$Timestamp = Get-Date -Format "yyyyMMddHHmmss"
$BackupDir = Join-Path $PSScriptRoot ".db-sync"
New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
$DumpPath = "/backup/prod_backup_$Timestamp.dump"

Write-Host "Dumping production database..."
docker run --rm -v "${BackupDir}:/backup" postgres:17 `
    pg_dump $env:PROD_DATABASE_URL -Fc -f $DumpPath
if ($LASTEXITCODE -ne 0) { throw "pg_dump failed" }

Write-Host "Renaming local '$DevDbName' to '${DevDbName}_pre_sync_backup_$Timestamp'..."
docker run --rm postgres:17 psql $DevAdminUrl -c `
    "ALTER DATABASE $DevDbName RENAME TO ${DevDbName}_pre_sync_backup_$Timestamp;"
if ($LASTEXITCODE -ne 0) { throw "rename failed" }

Write-Host "Creating fresh '$DevDbName'..."
docker run --rm postgres:17 psql $DevAdminUrl -c "CREATE DATABASE $DevDbName;"
if ($LASTEXITCODE -ne 0) { throw "create failed" }

Write-Host "Restoring production dump into '$DevDbName'..."
docker run --rm -v "${BackupDir}:/backup" postgres:17 `
    pg_restore --no-owner --no-privileges -d $DevTargetUrl $DumpPath

Write-Host "Done. Run 'npx prisma db pull' if you want to check for schema drift."
