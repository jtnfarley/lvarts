'use server'

import {prisma} from '@/prisma';
import { Prisma } from '@prisma/client';
import { deleteFromPlaylist } from '@/lib/azuracast';
import { saveTrustedPost } from '@/lib/posts/savePost';
import { activeBoostPredicate } from '@/lib/boostQueries';
import { FeedRow } from '@/lib/models/initFeedRow';
import UserDetails from '@/lib/models/userDetails';
import { isAdmin } from '@/lib/auth/isAdmin';
import { canModifyPost } from '@/lib/auth/canModifyPost';
import { isLoggedIn } from './currentUser';
import { notBlockedByViewer } from '@/lib/blocks';

const parentPostJoin = Prisma.sql`
    LEFT JOIN LATERAL (
        SELECT
            cp.postid,
            parent_ud.id,
            parent_ud.displayname
        FROM commentstopost cp
        JOIN usertoposts parent_utp
            ON parent_utp.postid = cp.postid
        JOIN userdetails parent_ud
            ON parent_ud.id = parent_utp.userdetailsid
        WHERE cp.commentpostid = p.id
        ORDER BY parent_utp.id
        LIMIT 1
    ) parent_post
        ON true
`

const parentPostSelect = Prisma.sql`
    CASE
        WHEN parent_post.postid IS NOT NULL THEN json_build_object(
            'postid', parent_post.postid,
            'userdetailsid', parent_post.id,
            'displayName', parent_post.displayname
        )
        ELSE NULL
    END AS "parentPost"
`

// Joining on the author is also where posts by users the viewer has blocked drop out,
// so every feed query that uses this join hides them.
const authorDetailsJoin = (viewerId?: number) => Prisma.sql`
    JOIN LATERAL (
        SELECT ud.*
        FROM usertoposts utp
        JOIN userdetails ud
            ON ud.id = utp.userdetailsid
        WHERE utp.postid = p.id
        ORDER BY utp.id
        LIMIT 1
    ) ud
        ON ${viewerId ? notBlockedByViewer(viewerId, Prisma.sql`ud.id`) : Prisma.sql`true`}
`

// The viewer comes from the session, never from an argument.
const viewerUserdetailsId = async (): Promise<number | undefined> => (await isLoggedIn())?.userdetails?.id

const feedRowSelect = Prisma.sql`
    SELECT DISTINCT ON (p.id)
        p.id,
        p.content,
        p.lexical,
        p.createdat,
        p.updatedat,
        p.edited,
        pt.posttype,
        p.privatepost,
        EXISTS (
            SELECT 1 FROM postboosts pb
            WHERE pb.postid = p.id AND ${activeBoostPredicate(Prisma.sql`pb`)}
        ) AS isboosted,
        p.postfile,
        json_build_object(
            'id', ud.id,
            'userid', ud.userid,
            'displayname', ud.displayname,
            'userdir', ud.userdir,
            'avatar', ud.avatar,
            'handle', ud.handle,
            'biohtml', ud.biohtml,
            'biolexical', ud.biolexical
        ) AS userdetails,
        CASE WHEN pt.posttype = 'event' THEN e.id END AS eventid,
        CASE WHEN pt.posttype = 'event' THEN e.eventname END AS eventname,
        CASE WHEN pt.posttype = 'event' THEN e.eventdate END AS eventdate,
        CASE WHEN pt.posttype = 'event' THEN v.id END AS venueid,
        CASE WHEN pt.posttype = 'event' THEN v.venuename END AS venuename,
        CASE WHEN pt.posttype = 'event' THEN v.address END AS address,
        --CASE WHEN pt.posttype = 'event' THEN c.city END AS city,
        --CASE WHEN pt.posttype = 'event' THEN s.stateabbr END AS state,
        --CASE WHEN pt.posttype = 'event' THEN z.zipcode END AS zipcode,
        ft.filetype,
        (select count(pl.postid)::int from postlikes pl where pl.postid = p.id) as likes,
        (select count(cp.postid)::int from commentstopost cp where cp.postid = p.id) as comments,
        json_build_object(
            'id', at.id,
            'trackname', at.trackname, 
            'artist', at.artist, 
            'album', at.album, 
            'releaseyear', at.releaseyear, 
            'coverartfile', at.coverartfile
        ) as audio,
        ${parentPostSelect}
`

// Private posts (e.g. imported events waiting for review) are left out of every feed by default.
const feedRowSharedJoins = (includePrivate: boolean, viewerId?: number) => Prisma.sql`
    JOIN posttypes pt
        ON pt.id = p.posttypeid
        ${includePrivate ? Prisma.empty : Prisma.sql`AND p.privatepost IS NOT TRUE`}
    LEFT JOIN filetypes ft
        ON ft.id = p.postfiletypeid
    LEFT JOIN events e
        ON e.id = p.eventid
    LEFT JOIN venues v
        ON v.id = e.venueid
    LEFT JOIN audiotracks at
        ON at.postid = p.id
    --LEFT JOIN cities c
        --ON c.id = v.cityid
    --LEFT JOIN states s
       -- ON s.id = v.stateid
    --LEFT JOIN zipcodes z
        --ON z.id = v.zipcodeid
    ${authorDetailsJoin(viewerId)}
    ${parentPostJoin}
`

const feedRowInnerQuery = (fromClause: Prisma.Sql, whereClause: Prisma.Sql = Prisma.empty, includePrivate = false, viewerId?: number) => Prisma.sql`
    ${feedRowSelect}
    ${fromClause}
    ${feedRowSharedJoins(includePrivate, viewerId)}
    ${whereClause}
    ORDER BY p.id, p.createdat DESC
`

const paginatedFeedQuery = (innerQuery: Prisma.Sql, offset:number) => Prisma.sql`
    SELECT *
    FROM (
        ${innerQuery}
    ) feed
    ORDER BY createdat DESC
    LIMIT 20
    OFFSET ${offset}
`

export const getFeedRow = async (userdetails:UserDetails, offset:number = 0, lastChecked:Date = new Date('2024-01-01'), includeBoosted:boolean = false):Promise<FeedRow[]> => {
    const userdetailsid = userdetails?.id
    const hasLastChecked = !!lastChecked

    if (!userdetailsid) {
        return []
    }

    if (!lastChecked) lastChecked = new Date('2024-01-01');

    const boostedPostsBranch = includeBoosted ? Prisma.sql`
        UNION

        SELECT p.id
        FROM postboosts pb
        JOIN posts p
            ON p.id = pb.postid
        WHERE ${activeBoostPredicate(Prisma.sql`pb`)}
    ` : Prisma.empty

    const eligiblePostsQuery = Prisma.sql`
        WITH followed AS (
            SELECT f.followinguserdetailsid
            FROM followers f
            WHERE f.userdetailsid = ${userdetailsid}
        ),
        scope_userdetails AS (
            SELECT ${userdetailsid}::int AS userdetailsid
            UNION
            SELECT followinguserdetailsid
            FROM followed
        ),
        eligible_posts AS (
            SELECT p.id
            FROM posts p
            WHERE (
                ${hasLastChecked} = false
                OR p.createdat > ${lastChecked}
            )
            AND (
                EXISTS (
                    SELECT 1
                    FROM usertoposts utp
                    WHERE utp.postid = p.id
                    AND utp.userdetailsid IN (
                        SELECT userdetailsid
                        FROM scope_userdetails
                    )
                )
                OR EXISTS (
                    SELECT 1
                    FROM postlikes pl
                    WHERE pl.postid = p.id
                    AND pl.userdetailsid IN (
                        SELECT userdetailsid
                        FROM scope_userdetails
                    )
                )
            )

            ${boostedPostsBranch}
        )
    `

    const viewerId = await viewerUserdetailsId()

    return await prisma.$queryRaw<FeedRow[]>(
        Prisma.sql`
            ${eligiblePostsQuery}
            ${paginatedFeedQuery(
                feedRowInnerQuery(
                    Prisma.sql`
                        FROM eligible_posts ep
                        JOIN posts p
                            ON p.id = ep.id
                    `,
                    Prisma.empty,
                    false,
                    viewerId
                ),
                offset
            )}
        `
    )
}

// A profile shows only what the user authored (posts and their own comments), never follow-graph
// or liked posts. The author is the first usertoposts row, matching authorDetailsJoin.
export const getUserPosts = async (userdetailsid:number, offset:number = 0):Promise<FeedRow[]> => {
    const viewerId = await viewerUserdetailsId()

    return await prisma.$queryRaw<FeedRow[]>(
        Prisma.sql`
            ${paginatedFeedQuery(
                feedRowInnerQuery(
                    Prisma.sql`
                        FROM posts p
                    `,
                    Prisma.sql`
                        WHERE (
                            SELECT utp.userdetailsid
                            FROM usertoposts utp
                            WHERE utp.postid = p.id
                            ORDER BY utp.id
                            LIMIT 1
                        ) = ${userdetailsid}
                    `,
                    false,
                    viewerId
                ),
                offset
            )}
        `
    )
}

export const getEvents = async ():Promise<FeedRow[]> => {
    const viewerId = await viewerUserdetailsId()

    return await prisma.$queryRaw<FeedRow[]>(
        Prisma.sql`
            ${
                feedRowInnerQuery(
                    Prisma.sql`
                        FROM events ev
                        JOIN posts p
                            ON p.eventid = ev.id
                    `,
                    Prisma.sql`
                    where ev.eventdate >= now()`,
                    false,
                    viewerId
                )
            }
        `
    )
}

export const getUpcomingEvents = async (limit: number = 5):Promise<FeedRow[]> => {
    const viewerId = await viewerUserdetailsId()

    return await prisma.$queryRaw<FeedRow[]>(
        Prisma.sql`
            SELECT * FROM (
                ${
                    feedRowInnerQuery(
                        Prisma.sql`
                            FROM events ev
                            JOIN posts p
                                ON p.eventid = ev.id
                        `,
                        Prisma.sql`
                        where ev.eventdate >= now()`,
                        false,
                        viewerId
                    )
                }
            ) feed
            ORDER BY eventdate ASC
            LIMIT ${limit}
        `
    )
}

export const getGallery = async ():Promise<FeedRow[]> => {
    const viewerId = await viewerUserdetailsId()

    return await prisma.$queryRaw<FeedRow[]>(
        Prisma.sql`
            ${
                feedRowInnerQuery(
                    Prisma.sql`
                        FROM posts p
                    `,
                    Prisma.sql`
                    where p.isgalleryfile = true`,
                    false,
                    viewerId
                )
            }
        `
    )
}

export const searchPosts = async (queryString:string):Promise<FeedRow[]> => {
    const trimmedQuery = queryString.trim()

    if (!trimmedQuery) {
        return []
    }

    const viewerId = await viewerUserdetailsId()

    return await prisma.$queryRaw<FeedRow[]>(
        paginatedFeedQuery(
            feedRowInnerQuery(
                Prisma.sql`
                    FROM posts p
                `,
                Prisma.sql`
                    WHERE
                        p.content ILIKE ${`%${trimmedQuery}%`}
                        OR ud.displayname ILIKE ${`%${trimmedQuery}%`}
                        OR ud.handle ILIKE ${`%${trimmedQuery}%`}
                        OR e.eventname ILIKE ${`%${trimmedQuery}%`}
                        OR v.venuename ILIKE ${`%${trimmedQuery}%`}
                        OR v.address ILIKE ${`%${trimmedQuery}%`}
                `,
                false,
                viewerId
            ),
            0
        )
    )
}

export const getPost = async (postid:number):Promise<FeedRow> => {
    // Only admins can open a private post, so pending imports can be previewed and edited.
    const post = await prisma.$queryRaw<FeedRow[]>(
        feedRowInnerQuery(
            Prisma.sql`
                FROM posts p
            `,
            Prisma.sql`
                WHERE p.id = ${postid}
            `,
            await isAdmin(),
            await viewerUserdetailsId()
        )
    )

    return post[0];
}

export const getCommentFeedRow = async (postid:number, offset:number = 0, lastChecked:Date = new Date('2024-01-01')):Promise<FeedRow[]> => {
    if (!lastChecked) lastChecked = new Date('2024-01-01');

    const viewerId = await viewerUserdetailsId()

    return await prisma.$queryRaw<FeedRow[]>(
        paginatedFeedQuery(
            feedRowInnerQuery(
                Prisma.sql`
                    FROM commentstopost cp
                    JOIN posts p
                        ON p.id = cp.commentpostid
                `,
                Prisma.sql`
                    WHERE cp.postid = ${postid}::int
                    AND p.createdat >= ${lastChecked}
                `,
                false,
                viewerId
            ),
            offset
        )
    )
}


// This is a server action, so any client can call it with any data: authorize here.
// The author comes from the session, never from the request. The exception is admins,
// who may post as another account (the admin event form posts as the calendar account)
// and may edit any post. Server code that has no session uses saveTrustedPost instead.
export const savePost = async (postData:any) => {
    const user = await isLoggedIn()
    const sessionUserdetailsId = user?.userdetails?.id
    if (!sessionUserdetailsId) {
        throw new Error('Not signed in')
    }

    const admin = await isAdmin()

    if (postData?.id !== undefined) {
        const author = await prisma.usertoposts.findFirst({
            where: { postid: postData.id },
            orderBy: { id: 'asc' },
            select: { userdetailsid: true }
        })

        if (!canModifyPost({
            authorUserdetailsId: author?.userdetailsid,
            userdetailsid: sessionUserdetailsId,
            isAdmin: admin
        })) {
            console.warn(`Refused edit of post ${postData.id} by user ${sessionUserdetailsId}`)
            throw new Error('You can only edit your own posts')
        }
    }

    const userdetailsid = admin && postData?.userdetailsid ? postData.userdetailsid : sessionUserdetailsId

    return saveTrustedPost({ ...postData, userdetailsid })
}

// This is a server action, so any client can call it with any id: authorize here.
// Returns null when the post is missing or the caller may not delete it.
export const deletePost = async (postid:number) => {
    if (!Number.isInteger(postid)) {
        return null
    }

    const post = await prisma.posts.findFirst({
        where: {
            id: postid
        }
    })

    if (!post) {
        return null
    }

    const user = await isLoggedIn()
    const author = await prisma.usertoposts.findFirst({
        where: { postid },
        orderBy: { id: 'asc' },
        select: { userdetailsid: true }
    })

    if (!canModifyPost({
        authorUserdetailsId: author?.userdetailsid,
        userdetailsid: user?.userdetails?.id,
        isAdmin: await isAdmin()
    })) {
        console.warn(`Refused delete of post ${postid} by user ${user?.userdetails?.id ?? 'anonymous'}`)
        return null
    }

    await prisma.commentstopost.deleteMany({
        where: {
            commentpostid: postid
        }
    });

    await prisma.commentstopost.deleteMany({
        where: {
            postid
        }
    });

    await prisma.usertoposts.deleteMany({
        where: {
            postid
        }
    })

    const postNotifications = await prisma.notifications.findMany({
        where: {
            postid
        }
    })

    if (postNotifications) {
        for (const noti of postNotifications) {
            await prisma.userstonotifications.deleteMany({
                where: {
                    notificationid: noti.id
                }
            })
        }

        await prisma.notifications.deleteMany({
            where: {
                postid
            }
        })
    }

    await prisma.postlikes.deleteMany({
        where: {
            postid
        }
    })

    const audiotrack = await prisma.audiotracks.findFirst({
        where: {
            postid
        }
    })

    if (audiotrack?.azuracastid) {
        await deleteFromPlaylist(audiotrack.azuracastid);
    }

    await prisma.audiotracks.deleteMany({
        where: {
            postid
        }
    })

    await prisma.posts.deleteMany({
        where: {
            id: postid
        }
    })

    if (post.posttypeid === 3 && post.eventid) {
        await prisma.events.deleteMany({
            where: {
                id: post.eventid
            }
        })
    }

    return true;
}
