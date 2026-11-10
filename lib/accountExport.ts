import { prisma } from '@/prisma';
import imageUrl from '@/constants/imageUrl';

// Only the person's own data. Other people appear as handles, never emails, and device
// push tokens (which work like credentials) are reduced to a count.
export const buildAccountExport = async (userdetailsid: number) => {
    const details = await prisma.userdetails.findUnique({
        where: { id: userdetailsid },
        include: { User: { select: { email: true, createdAt: true } }, userdetailsurls: true },
    });
    if (!details) return undefined;

    const fileUrl = (userdir: string | null, filename: string | null) =>
        userdir && filename ? `${imageUrl}/${userdir}/${filename}` : null;

    // The first usertoposts row of a post is its author; later rows are people attached to it.
    const authored = await prisma.$queryRaw<{ postid: number }[]>`
        SELECT ut.postid
        FROM usertoposts ut
        WHERE ut.userdetailsid = ${userdetailsid}
          AND ut.id = (SELECT MIN(first.id) FROM usertoposts first WHERE first.postid = ut.postid)
    `;

    const handleSelect = { select: { handle: true } } as const;

    const [posts, likes, following, followers, blocks, notifications, boosts, reports, deviceCount, settings, aiRequests] =
        await Promise.all([
            prisma.posts.findMany({
                where: { id: { in: authored.map((row) => row.postid) } },
                orderBy: { createdat: 'asc' },
                include: {
                    posttypes: true,
                    audiotracks: true,
                    events: { include: { venues: true } },
                    commentstopost_commentstopost_commentpostidToposts: { select: { postid: true } },
                },
            }),
            prisma.postlikes.findMany({ where: { userdetailsid }, select: { postid: true } }),
            prisma.followers.findMany({
                where: { userdetailsid },
                select: { userdetails_followers_followinguserdetailsidTouserdetails: handleSelect },
            }),
            prisma.followers.findMany({
                where: { followinguserdetailsid: userdetailsid },
                select: { userdetails_followers_userdetailsidTouserdetails: handleSelect },
            }),
            prisma.userblocks.findMany({
                where: { blockeruserdetailsid: userdetailsid },
                select: { createdat: true, blocked: handleSelect },
            }),
            prisma.userstonotifications.findMany({
                where: { OR: [{ senderuserdetailsid: userdetailsid }, { receiveruserdetailsid: userdetailsid }] },
                select: {
                    senderuserdetailsid: true,
                    notifications: { select: { createdat: true, read: true, postid: true, notificationtypes: true } },
                    userdetails_userstonotifications_senderuserdetailsidTouserdetails: handleSelect,
                    userdetails_userstonotifications_receiveruserdetailsidTouserdetails: handleSelect,
                },
            }),
            prisma.postboosts.findMany({ where: { userdetailsid }, orderBy: { createdat: 'asc' } }),
            prisma.reports.findMany({
                where: { reporteruserdetailsid: userdetailsid },
                select: {
                    postid: true,
                    reason: true,
                    details: true,
                    status: true,
                    createdat: true,
                    reporteduser: handleSelect,
                },
            }),
            prisma.pushtokens.count({ where: { userdetailsid } }),
            prisma.notificationsettings.findUnique({ where: { userdetailsid } }),
            prisma.aiusage.findMany({ where: { userdetailsid }, select: { kind: true, createdat: true } }),
        ]);

    return {
        exportedAt: new Date().toISOString(),
        account: { email: details.User.email, createdAt: details.User.createdAt },
        profile: {
            displayName: details.displayname,
            handle: details.handle,
            bioHtml: details.biohtml,
            bioLexical: details.biolexical,
            avatarUrl: fileUrl(details.userdir, details.avatar),
            links: details.userdetailsurls.map(({ urlname, url }) => ({ name: urlname, url })),
            createdAt: details.createdat,
        },
        // Includes your comments (type "comment", with the post they replied to), private posts
        // and imported events you have not published yet.
        posts: posts.map((post) => ({
            id: post.id,
            type: post.posttypes.posttype,
            createdAt: post.createdat,
            updatedAt: post.updatedat,
            edited: post.edited,
            private: post.privatepost,
            contentHtml: post.content,
            contentLexical: post.lexical,
            fileUrl: fileUrl(details.userdir, post.postfile),
            inGallery: post.isgalleryfile,
            repliedToPostId: post.commentstopost_commentstopost_commentpostidToposts[0]?.postid ?? null,
            event: post.events && {
                name: post.events.eventname,
                date: post.events.eventdate,
                venue: post.events.venues?.venuename ?? null,
            },
            audio: post.audiotracks.map((track) => ({
                trackName: track.trackname,
                artist: track.artist,
                album: track.album,
                releaseYear: track.releaseyear,
                coverArtUrl: fileUrl(details.userdir, track.coverartfile),
            })),
        })),
        likedPostIds: likes.map((like) => like.postid),
        following: following.map((row) => row.userdetails_followers_followinguserdetailsidTouserdetails.handle),
        followers: followers.map((row) => row.userdetails_followers_userdetailsidTouserdetails.handle),
        blockedUsers: blocks.map((block) => ({ handle: block.blocked.handle, blockedAt: block.createdat })),
        notifications: notifications.map((row) => ({
            type: row.notifications.notificationtypes.notificationtype,
            direction: row.senderuserdetailsid === userdetailsid ? 'sent' : 'received',
            from: row.userdetails_userstonotifications_senderuserdetailsidTouserdetails.handle,
            to: row.userdetails_userstonotifications_receiveruserdetailsidTouserdetails.handle,
            postId: row.notifications.postid,
            read: row.notifications.read,
            createdAt: row.notifications.createdat,
        })),
        notificationSettings: settings && {
            pushPaused: settings.pushpaused,
            pushLikes: settings.pushlikes,
            pushComments: settings.pushcomments,
            pushMentions: settings.pushmentions,
            pushFollows: settings.pushfollows,
        },
        registeredPushDevices: deviceCount,
        boosts: boosts.map((boost) => ({
            postId: boost.postid,
            amountCents: boost.budgetcents,
            impressionsPurchased: boost.impressionspurchased,
            status: boost.status,
            stripePaymentIntentId: boost.stripepaymentintentid,
            activatedAt: boost.activatedat,
            expiresAt: boost.expiresat,
            createdAt: boost.createdat,
        })),
        reportsFiled: reports.map((report) => ({
            postId: report.postid,
            reportedUser: report.reporteduser?.handle ?? null,
            reason: report.reason,
            details: report.details,
            status: report.status,
            createdAt: report.createdat,
        })),
        aiRequests: aiRequests.map((request) => ({ kind: request.kind, createdAt: request.createdat })),
    };
};
