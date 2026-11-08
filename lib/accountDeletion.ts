import type { Prisma } from '@prisma/client';
import { prisma } from '@/prisma';
import { deleteFromPlaylist } from '@/lib/azuracast';
import { deleteUserDirectory, deleteUserFile } from '@/lib/bunny';

// What lives outside the database and must be cleaned up once the transaction commits.
export type ExternalCleanup = {
    userdir: string | null;
    files: { userdir: string; filename: string }[];
    azuracastIds: bigint[];
};

type PostFileRow = {
    postfile: string | null;
    coverartfile: string | null;
    azuracastid: bigint | null;
    userdir: string | null;
};

const LOCAL_DATABASE_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

// Deletion is irreversible and also removes real CDN and radio files, so a dev server
// must never run it against a remote database (e.g. production credentials left behind
// in a shell). Looks at the host after the last "@" because passwords may contain one.
const assertNotRemoteDatabaseInDevelopment = () => {
    if (process.env.NODE_ENV === 'production') return;

    const url = process.env.postgresql_DATABASE_URL ?? '';
    const host = url.slice(url.lastIndexOf('@') + 1).match(/^(\[[^\]]+\]|[^:/?]+)/)?.[0] ?? '';
    if (!LOCAL_DATABASE_HOSTS.has(host)) {
        throw new Error('Refusing to delete an account outside production while connected to a non-local database');
    }
};

// Deletes the account and everything it owns: the user's posts and comments, every
// reply thread under those posts (including other people's comments), and all
// likes, follows, notifications and tokens tied to the user. All-or-nothing.
export const deleteAccountData = async (userid: number): Promise<ExternalCleanup> => {
    assertNotRemoteDatabaseInDevelopment();

    return prisma.$transaction(
        async (tx) => {
            const user = await tx.user.findUnique({
                where: { id: userid },
                include: { userdetails: true },
            });
            if (!user) throw new Error(`User ${userid} not found`);

            const cleanup: ExternalCleanup = {
                userdir: user.userdetails?.userdir ?? null,
                files: [],
                azuracastIds: [],
            };

            if (user.userdetails) {
                await deleteProfileAndContent(tx, user.userdetails.id, cleanup);
            }

            await tx.session.deleteMany({ where: { userId: userid } });
            await tx.account.deleteMany({ where: { userId: userid } });
            await tx.verificationToken.deleteMany({ where: { identifier: user.email } });
            await tx.user.delete({ where: { id: userid } });

            return cleanup;
        },
        { timeout: 60_000, maxWait: 10_000 }
    );
};

const deleteProfileAndContent = async (
    tx: Prisma.TransactionClient,
    userdetailsid: number,
    cleanup: ExternalCleanup
) => {
    // The first usertoposts row of a post is its author; later rows are other people
    // attached to it, whose posts must survive.
    const authored = await tx.$queryRaw<{ postid: number }[]>`
        SELECT ut.postid
        FROM usertoposts ut
        WHERE ut.userdetailsid = ${userdetailsid}
          AND ut.id = (SELECT MIN(first.id) FROM usertoposts first WHERE first.postid = ut.postid)
    `;
    const authoredIds = authored.map((row) => row.postid);

    // Every comment, and comment on a comment, under the user's posts. UNION (not
    // UNION ALL) also stops the recursion if the data ever contains a cycle.
    const replies = await tx.$queryRaw<{ postid: number }[]>`
        WITH RECURSIVE thread AS (
            SELECT commentpostid AS postid FROM commentstopost WHERE postid = ANY(${authoredIds}::int[])
            UNION
            SELECT c.commentpostid FROM commentstopost c JOIN thread t ON c.postid = t.postid
        )
        SELECT postid FROM thread
    `;
    const postIds = [...new Set([...authoredIds, ...replies.map((row) => row.postid)])];

    // Collect files and radio tracks first; the rows that point to them are about to go.
    const fileRows = await tx.$queryRaw<PostFileRow[]>`
        SELECT p.postfile, atr.coverartfile, atr.azuracastid, ud.userdir
        FROM posts p
        JOIN usertoposts ut ON ut.postid = p.id
          AND ut.id = (SELECT MIN(first.id) FROM usertoposts first WHERE first.postid = p.id)
        JOIN userdetails ud ON ud.id = ut.userdetailsid
        LEFT JOIN audiotracks atr ON atr.postid = p.id
        WHERE p.id = ANY(${postIds}::int[])
    `;
    for (const { postfile, coverartfile, azuracastid, userdir } of fileRows) {
        if (azuracastid !== null) cleanup.azuracastIds.push(azuracastid);
        if (!userdir) continue;
        for (const filename of [postfile, coverartfile]) {
            if (filename) cleanup.files.push({ userdir, filename });
        }
    }

    const touchedNotifications = await tx.userstonotifications.findMany({
        where: {
            OR: [{ senderuserdetailsid: userdetailsid }, { receiveruserdetailsid: userdetailsid }],
        },
        select: { notificationid: true },
    });
    const postNotifications = await tx.notifications.findMany({
        where: { postid: { in: postIds } },
        select: { id: true },
    });
    const notificationIds = [
        ...new Set([
            ...touchedNotifications.map((row) => row.notificationid),
            ...postNotifications.map((row) => row.id),
        ]),
    ];

    const boosts = await tx.postboosts.findMany({
        where: { OR: [{ postid: { in: postIds } }, { userdetailsid }] },
        select: { id: true },
    });
    const boostIds = boosts.map((boost) => boost.id);

    const events = await tx.posts.findMany({
        where: { id: { in: postIds }, eventid: { not: null } },
        select: { eventid: true },
    });
    const eventIds = events.flatMap((post) => (post.eventid === null ? [] : [post.eventid]));

    // Children first: every foreign key here is NO ACTION.
    await tx.userstonotifications.deleteMany({ where: { notificationid: { in: notificationIds } } });
    await tx.notifications.deleteMany({ where: { id: { in: notificationIds } } });
    await tx.postboostimpressions.deleteMany({
        where: { OR: [{ postboostid: { in: boostIds } }, { userdetailsid }] },
    });
    await tx.postboosts.deleteMany({ where: { id: { in: boostIds } } });
    await tx.postlikes.deleteMany({
        where: { OR: [{ postid: { in: postIds } }, { userdetailsid }] },
    });
    await tx.commentstopost.deleteMany({
        where: { OR: [{ postid: { in: postIds } }, { commentpostid: { in: postIds } }] },
    });
    await tx.audiotracks.deleteMany({ where: { postid: { in: postIds } } });
    await tx.usertoposts.deleteMany({
        where: { OR: [{ postid: { in: postIds } }, { userdetailsid }] },
    });
    await tx.posts.deleteMany({ where: { id: { in: postIds } } });
    await tx.events.deleteMany({ where: { id: { in: eventIds }, posts: { none: {} } } });

    await tx.followers.deleteMany({
        where: { OR: [{ userdetailsid }, { followinguserdetailsid: userdetailsid }] },
    });
    await tx.pushtokens.deleteMany({ where: { userdetailsid } });
    await tx.userdetailsurls.deleteMany({ where: { userdetailsid } });
    await tx.userdetails.delete({ where: { id: userdetailsid } });
};

// Best effort, after the database commit: a leftover file is better than a failed
// deletion the user has to retry. Failures are logged, not thrown.
export const removeExternalFiles = async ({ userdir, files, azuracastIds }: ExternalCleanup) => {
    const jobs: { label: string; run: () => Promise<void> }[] = [
        ...azuracastIds.map((id) => ({
            label: `AzuraCast track ${id}`,
            run: () => deleteFromPlaylist(id),
        })),
        ...files.map(({ userdir: dir, filename }) => ({
            label: `file ${dir}/${filename}`,
            run: () => deleteUserFile(dir, filename),
        })),
    ];
    // The user's own directory last: it covers their avatar and anything not in the list.
    if (userdir) {
        jobs.push({ label: `directory ${userdir}`, run: () => deleteUserDirectory(userdir) });
    }

    const results = await Promise.allSettled(jobs.map((job) => job.run()));
    results.forEach((result, index) => {
        if (result.status === 'rejected') {
            console.error(`Account deletion cleanup failed for ${jobs[index].label}`, result.reason);
        }
    });
};
