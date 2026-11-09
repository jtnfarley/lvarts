import { Prisma } from '@prisma/client';
import { prisma } from '@/prisma';

// A deliberately plain module, not a 'use server' file: the actions in app/actions/blocks.ts
// are the public entry points and decide who the blocker is.

// SQL condition: `viewerId` has NOT blocked the user whose id `authorId` evaluates to.
export const notBlockedByViewer = (viewerId: number, authorId: Prisma.Sql) => Prisma.sql`
    NOT EXISTS (
        SELECT 1 FROM userblocks ub
        WHERE ub.blockeruserdetailsid = ${viewerId}
        AND ub.blockeduserdetailsid = ${authorId}
    )
`;

export const hasBlocked = async (blockerId: number, blockedId: number): Promise<boolean> => {
    const rows = await prisma.$queryRaw<Array<{ found: number }>>`
        SELECT 1 AS found FROM userblocks
        WHERE blockeruserdetailsid = ${blockerId} AND blockeduserdetailsid = ${blockedId}
    `;
    return rows.length > 0;
};

// True when either user has blocked the other.
export const hasBlockBetween = async (userA: number, userB: number): Promise<boolean> => {
    const rows = await prisma.$queryRaw<Array<{ found: number }>>`
        SELECT 1 AS found FROM userblocks
        WHERE (blockeruserdetailsid = ${userA} AND blockeduserdetailsid = ${userB})
        OR (blockeruserdetailsid = ${userB} AND blockeduserdetailsid = ${userA})
    `;
    return rows.length > 0;
};

export type BlockedUser = {
    id: number;
    handle: string | null;
    displayname: string | null;
    avatar: string | null;
    userdir: string | null;
};

export const getBlockedUsers = async (blockerId: number): Promise<BlockedUser[]> =>
    prisma.$queryRaw<BlockedUser[]>`
        SELECT ud.id, ud.handle, ud.displayname, ud.avatar, ud.userdir
        FROM userblocks ub
        JOIN userdetails ud ON ud.id = ub.blockeduserdetailsid
        WHERE ub.blockeruserdetailsid = ${blockerId}
        ORDER BY ub.createdat DESC
    `;
