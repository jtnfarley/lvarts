import { prisma } from '@/prisma';

// A deliberately plain module, not a 'use server' file: callers decide who is spending.

export type UsageRules = {
    perUserLimit: number;
    siteLimit: number;
    windowHours: number;
};

export type UsageClaim = { ok: true; id: number } | { ok: false; reason: 'user' | 'site' };

// Counts one use of an expensive AI feature, or says why it is not allowed. The check and
// the insert run under a lock per kind: without it, a burst of simultaneous requests would
// all read the same count and every one of them would pass.
export const claimAiUse = async (kind: string, userdetailsid: number, rules: UsageRules): Promise<UsageClaim> =>
    prisma.$transaction(async (tx) => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${kind}))`;

        const [counts] = await tx.$queryRaw<Array<{ site: number; mine: number }>>`
            SELECT
                COUNT(*)::int AS site,
                COUNT(*) FILTER (WHERE userdetailsid = ${userdetailsid})::int AS mine
            FROM aiusage
            WHERE kind = ${kind} AND createdat > now() - make_interval(hours => ${rules.windowHours}::int)
        `;
        if (counts.mine >= rules.perUserLimit) return { ok: false, reason: 'user' } as const;
        if (counts.site >= rules.siteLimit) return { ok: false, reason: 'site' } as const;

        const row = await tx.aiusage.create({ data: { userdetailsid, kind }, select: { id: true } });
        return { ok: true, id: row.id } as const;
    });

// Gives the use back when the request failed, so a flaky provider does not burn the quota.
export const releaseAiUse = async (id: number): Promise<void> => {
    await prisma.aiusage.deleteMany({ where: { id } });
};
