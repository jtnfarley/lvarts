'use server'

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { isLoggedIn } from '@/app/data/currentUser';
import { prisma } from '@/prisma';

type BlockResult = { ok: true } | { ok: false; error: string };

const targetSchema = z.object({ userdetailsid: z.number().int().positive() });

// The blocker is always the logged-in user; the browser only says who to block.
const parseRequest = async (input: unknown): Promise<{ blockerId: number; blockedId: number } | { error: string }> => {
    const parsed = targetSchema.safeParse(input);
    if (!parsed.success) return { error: 'That user could not be found.' };

    const blockerId = (await isLoggedIn())?.userdetails?.id;
    if (!blockerId) return { error: 'Please sign in first.' };
    if (blockerId === parsed.data.userdetailsid) return { error: "You can't block yourself." };

    return { blockerId, blockedId: parsed.data.userdetailsid };
};

export const blockUser = async (input: unknown): Promise<BlockResult> => {
    const request = await parseRequest(input);
    if ('error' in request) return { ok: false, error: request.error };
    const { blockerId, blockedId } = request;

    const target = await prisma.userdetails.findUnique({ where: { id: blockedId }, select: { id: true } });
    if (!target) return { ok: false, error: 'That user could not be found.' };

    // Blocking also ends any follow in either direction, in the same step.
    await prisma.$transaction([
        prisma.$executeRaw`
            INSERT INTO userblocks (blockeruserdetailsid, blockeduserdetailsid)
            VALUES (${blockerId}, ${blockedId})
            ON CONFLICT DO NOTHING
        `,
        prisma.followers.deleteMany({
            where: {
                OR: [
                    { userdetailsid: blockerId, followinguserdetailsid: blockedId },
                    { userdetailsid: blockedId, followinguserdetailsid: blockerId },
                ],
            },
        }),
    ]);

    revalidatePath('/', 'layout');
    return { ok: true };
};

export const unblockUser = async (input: unknown): Promise<BlockResult> => {
    const request = await parseRequest(input);
    if ('error' in request) return { ok: false, error: request.error };

    await prisma.$executeRaw`
        DELETE FROM userblocks
        WHERE blockeruserdetailsid = ${request.blockerId} AND blockeduserdetailsid = ${request.blockedId}
    `;

    revalidatePath('/', 'layout');
    return { ok: true };
};
