import { Prisma } from '@prisma/client'

export const activeBoostPredicate = (alias: Prisma.Sql) => Prisma.sql`
    ${alias}.status = 'active'
    AND ${alias}.expiresat > now()
    AND (SELECT COUNT(*) FROM postboostimpressions pbi WHERE pbi.postboostid = ${alias}.id) < ${alias}.impressionspurchased
`
