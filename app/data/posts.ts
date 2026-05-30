'use server'

import {prisma} from '@/prisma';
import { Prisma } from '@prisma/client';
import { notifyMentionedUsers } from './postMentions';
import { generateUniqueHandle } from './handles';
import { FeedRow } from '@/lib/models/initFeedRow';
import UserDetails from '@/lib/models/userDetails';

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

const authorDetailsJoin = Prisma.sql`
    JOIN LATERAL (
        SELECT ud.*
        FROM usertoposts utp
        JOIN userdetails ud
            ON ud.id = utp.userdetailsid
        WHERE utp.postid = p.id
        ORDER BY utp.id
        LIMIT 1
    ) ud
        ON true
`

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
        ${parentPostSelect}
`

const feedRowSharedJoins = Prisma.sql`
    JOIN posttypes pt
        ON pt.id = p.posttypeid
    LEFT JOIN filetypes ft
        ON ft.id = p.postfiletypeid
    LEFT JOIN events e
        ON e.id = p.eventid
    LEFT JOIN venues v
        ON v.id = e.venueid
    --LEFT JOIN cities c
        --ON c.id = v.cityid
    --LEFT JOIN states s
       -- ON s.id = v.stateid
    --LEFT JOIN zipcodes z
        --ON z.id = v.zipcodeid
    ${authorDetailsJoin}
    ${parentPostJoin}
`

const feedRowInnerQuery = (fromClause: Prisma.Sql, whereClause: Prisma.Sql = Prisma.empty) => Prisma.sql`
    ${feedRowSelect}
    ${fromClause}
    ${feedRowSharedJoins}
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

export const getFeedRow = async (userdetails:UserDetails, offset:number = 0, lastChecked:Date = new Date('2024-01-01')):Promise<FeedRow[]> => {
    const userdetailsid = userdetails?.id
    const hasLastChecked = !!lastChecked

    if (!userdetailsid) {
        return []
    }

    if (!lastChecked) lastChecked = new Date('2024-01-01');

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
        )
    `

    return await prisma.$queryRaw<FeedRow[]>(
        Prisma.sql`
            ${eligiblePostsQuery}
            ${paginatedFeedQuery(
                feedRowInnerQuery(
                    Prisma.sql`
                        FROM eligible_posts ep
                        JOIN posts p
                            ON p.id = ep.id
                    `
                ),
                offset
            )}
        `
    )
}

export const getEvents = async ():Promise<FeedRow[]> => {
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
                    where ev.eventdate >= now()`
                )
            }
        `
    )
}

export const getGallery = async ():Promise<FeedRow[]> => {
    return await prisma.$queryRaw<FeedRow[]>(
        Prisma.sql`
            ${
                feedRowInnerQuery(
                    Prisma.sql`
                        FROM posts p
                    `,
                    Prisma.sql`
                    where p.isgalleryfile = true`
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
                `
            ),
            0
        )
    )
}

export const getPost = async (postid:number):Promise<FeedRow> => {
    const post = await prisma.$queryRaw<FeedRow[]>(
        feedRowInnerQuery(
            Prisma.sql`
                FROM posts p
            `,
            Prisma.sql`
                WHERE p.id = ${postid}
            `
        )
    )

    return post[0];
}

export const getCommentFeedRow = async (postid:number, offset:number = 0, lastChecked:Date = new Date('2024-01-01')):Promise<FeedRow[]> => {
    if (!lastChecked) lastChecked = new Date('2024-01-01');

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
                `
            ),
            offset
        )
    )
}


export const savePost = async (postData:any) => {
    const {
        id,
        content, 
        lexical, 
        userdetailsid, 
        posttype, 
        postfile, 
        postfiletype, 
        isgalleryfile,
        privatePost, 
        parentPostId, 
        edited,
        eventname,
        eventdate,  
        privatepost, 
        venuename,
        address
    } = postData

    let {venueid, eventid} = postData

    const date = new Date()
    const createdat = date
    const updatedat = date

    let posttypeid = 1;
    
    const postTypeQuery = await prisma.posttypes.findFirst({
        where: {
            posttype
        },
        select: {
            id: true
        }
    })

    if ((posttype && posttype === 'event') || (posttypeid && posttypeid === 3)) {
        if (!venueid && venuename) {
            const vid = await saveVenue({
                venuename,
                address
            });

            if (vid) {
                venueid = vid.id
            }
        }

        if (venueid) {
            eventid = await saveEvent({
                eventdate,
                eventname,
                venueid,
                eventid,
            })
        }
    }

    let postfiletypeid;
    if (postfile && postfiletype) {
        postfiletypeid = await prisma.filetypes.findFirst({
            where:{
                filetype: postfiletype
            }
        })
    }

    if (postTypeQuery && postTypeQuery.id) posttypeid = postTypeQuery.id;

    const postDataCreate = {
        content,
        lexical: lexical ?? null,
        posttypeid,
        edited, 
        createdat,
        updatedat,
        privatepost,
        eventid: (eventid) ? eventid : null,
        postfiletypeid: (postfiletypeid && postfiletypeid.id) ? postfiletypeid.id : null,
        postfile,
        isgalleryfile
    }

    let post;
    if (id) {
        post = await prisma.posts.update({
            where: {
                id
            },
            data: postDataCreate,
        })
    } else {
        post = await prisma.posts.create({
            data: postDataCreate,
        })
    }

    if (post && post.id) {
        await prisma.usertoposts.create({
            data: {
                postid: post.id,
                userdetailsid
            },
        })
    }

    if (posttype === 'comment' && parentPostId) {
        await prisma.commentstopost.create({
            data: {
                postid: Number.parseInt(parentPostId),
                commentpostid: post.id
            }
        })

        await notifyParentPostAuthor(Number.parseInt(parentPostId), userdetailsid);
    }

    await notifyMentionedUsers({
        postid: post.id,
        authorUserDetailsId: userdetailsid,
        lexical
    })
    
    return post
}

const notifyParentPostAuthor = async (postid:number, senderuserdetailsid:number) => {
    const postAuthor = await prisma.$queryRaw<Array<{ userdetailsid: number }>>`
        select userdetailsid
        from usertoposts
        where postid = ${postid}
    `

    if (postAuthor && postAuthor.length) {
        const notificationid = await prisma.notifications.create({
            data: {
                notificationtypeid: 2,
                createdat: new Date(),
                postid
            }
        })

        if (notificationid && notificationid.id) {
            await prisma.userstonotifications.create({
                data: {
                    notificationid: notificationid.id,
                    senderuserdetailsid,
                    receiveruserdetailsid: postAuthor[0].userdetailsid
                }
            })
        }
    }
}

export const likePostDAL = async (postid:number, userdetailsid:number) => {
    const userAlreadyLiked = await prisma.postlikes.findFirst({
        where: {
            postid,
            userdetailsid
        }
    })

    if (userAlreadyLiked) return;

    await prisma.postlikes.create({
        data: {
            postid,
            userdetailsid
        }
    })

    /***** notify post author */

    const postAuthor = await prisma.usertoposts.findFirst({
        where: {
            postid
        }
    })

    if (postAuthor) {
        const notification = await prisma.notifications.create({
            data: {
                notificationtypeid: 1,
                read: false,
                createdat: new Date(),
                postid
            }
        })

        if (notification) {
            await prisma.userstonotifications.create({
                data: {
                    notificationid: notification.id,
                    senderuserdetailsid: userdetailsid,
                    receiveruserdetailsid: postAuthor.userdetailsid
                }
            })
        }
    }
}

export const unlikePostDAL = async  (postid:number, userdetailsid:number) => {
    await prisma.postlikes.deleteMany({
        where: {
            postid,
            userdetailsid
        }
    })
}

export const deletePost = async (postid:number) => {

    const post = await prisma.posts.findFirst({
        where: {
            id: postid
        }
    })

    if (!post) {
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

    if (post.posttypeid === 3 && post.eventid) {
        await prisma.events.deleteMany({
            where: {
                id: post.eventid
            }
        })
    }

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

    await prisma.posts.deleteMany({
        where: {
            id: postid
        }
    })

    return true;
}

const saveVenue = async (venueData:{venuename: string, address?: string}) => {
    const {venuename, address} = venueData;

    return await prisma.venues.create({
        data: {
            venuename, 
            address: address ?? null
        }
    })
}

const saveEvent = async (eventData:{eventname:string, eventdate:Date, venueid:number, eventid?:number}) => {
    const {eventdate, eventname, venueid} = eventData;

    let {eventid} = eventData;

    if (eventid) {
        await prisma.events.update({
            where: {
                id: eventid
            },
            data:{
                eventdate,
                eventname,
                venueid
            }
        })
    } else {
        const event = await prisma.events.create({
            data:{
                eventdate,
                eventname,
                venueid
            }
        })

        if (event) eventid = event.id;
    }

    return eventid;
}
