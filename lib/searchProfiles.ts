import { Prisma } from '@prisma/client';
import { prisma } from '@/prisma';
import { isLoggedIn } from '@/app/data/currentUser';
import { notBlockedByViewer } from '@/lib/blocks';

// A deliberately plain module, not a 'use server' file: the viewer is read from the session,
// and app/actions/search.ts is the public entry point for the typeahead.

export type ProfileResult = {
    id: number;
    handle: string;
    displayname: string | null;
    avatar: string | null;
    userdir: string | null;
    biohtml: string | null;
};

export const PROFILE_RESULT_LIMIT = 50;

// Handles contain "_", which ILIKE treats as a wildcard unless it is escaped.
const escapeLike = (text: string) => text.replace(/[\\%_]/g, (character) => `\\${character}`);

export const searchProfiles = async (queryString: string, limit = PROFILE_RESULT_LIMIT): Promise<ProfileResult[]> => {
    const term = queryString.trim().replace(/^[@#]+/, '');

    if (!term) {
        return [];
    }

    const viewerId = (await isLoggedIn())?.userdetails?.id;
    const contains = `%${escapeLike(term)}%`;
    const startsWith = `${escapeLike(term)}%`;
    const bioText = Prisma.sql`regexp_replace(COALESCE(ud.biohtml, ''), '<[^>]*>', '', 'g')`;

    return prisma.$queryRaw<ProfileResult[]>`
        SELECT ud.id, ud.handle, ud.displayname, ud.avatar, ud.userdir, ud.biohtml
        FROM userdetails ud
        WHERE COALESCE(ud.handle, '') <> ''
        AND ud.suspended IS NOT TRUE
        AND (
            ud.handle ILIKE ${contains}
            OR ud.displayname ILIKE ${contains}
            OR ${bioText} ILIKE ${contains}
        )
        AND ${viewerId ? notBlockedByViewer(viewerId, Prisma.sql`ud.id`) : Prisma.sql`true`}
        ORDER BY
            CASE
                WHEN lower(ud.handle) = lower(${term}) THEN 0
                WHEN ud.handle ILIKE ${startsWith} OR ud.displayname ILIKE ${startsWith} THEN 1
                WHEN ud.handle ILIKE ${contains} OR ud.displayname ILIKE ${contains} THEN 2
                ELSE 3
            END,
            (SELECT count(*) FROM followers f WHERE f.followinguserdetailsid = ud.id) DESC,
            ud.id
        LIMIT ${limit}
    `;
};
