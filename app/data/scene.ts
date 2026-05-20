'use server'

import { Prisma } from '@prisma/client'

import { prisma } from '@/prisma'
import type { FeedRow } from '@/lib/models/initFeedRow'
import { getPostTypeLabel, SCENE_COMMUNITY_POST_TYPES } from '@/lib/scenePosts'

type TrendItem = {
    label: string
    count: number
}

type TrendRadar = {
    posttypes: TrendItem[]
    towns: TrendItem[]
    tags: TrendItem[]
}

export interface SceneHubData {
    collabs: FeedRow[]
    recommendations: FeedRow[]
    openMicAndJam: FeedRow[]
    mapPosts: FeedRow[]
    trendRadar: TrendRadar
}

const getTopCounts = (values:Array<string>, limit = 5): TrendItem[] => {
    const counts = new Map<string, number>()

    values.forEach((value) => {
        const normalized = value.trim()

        if (!normalized) {
            return
        }

        counts.set(normalized, (counts.get(normalized) || 0) + 1)
    })

    return [...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([label, count]) => ({
            label,
            count
        }))
}

const buildTrendRadar = (posts:FeedRow[]): TrendRadar => {
    const posttypes = posts
        .map((post) => getPostTypeLabel(post.posttype))
        .filter(Boolean)

    const towns = posts
        .map((post) => {
            const addressParts = post.address?.split(',') || []
            return addressParts.length > 1 ? addressParts[1].trim() : ''
        })
        .filter(Boolean)

    return {
        posttypes: getTopCounts(posttypes),
        towns: getTopCounts(towns),
        tags: []
    }
}

const getSceneRows = async (
    posttypes: string[],
    options?: {
        requireAddress?: boolean
        upcomingOnly?: boolean
        take?: number
    }
): Promise<FeedRow[]> => {
    const requireAddress = options?.requireAddress ?? false
    const upcomingOnly = options?.upcomingOnly ?? false
    const take = options?.take ?? 12

    return await prisma.$queryRaw<FeedRow[]>(
        Prisma.sql`
            SELECT *
            FROM (
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
                    CASE WHEN pt.posttype = 'event' OR p.eventid IS NOT NULL THEN e.eventname END AS eventname,
                    CASE WHEN pt.posttype = 'event' OR p.eventid IS NOT NULL THEN e.eventdate END AS eventdate,
                    CASE WHEN pt.posttype = 'event' OR p.eventid IS NOT NULL THEN v.venuename END AS venuename,
                    CASE WHEN pt.posttype = 'event' OR p.eventid IS NOT NULL THEN v.address END AS address,
                    ft.filetype,
                    (SELECT count(pl.postid)::int FROM postlikes pl WHERE pl.postid = p.id) AS likes,
                    (SELECT count(cp.postid)::int FROM commentstopost cp WHERE cp.postid = p.id) AS comments,
                    CASE
                        WHEN parent_post.postid IS NOT NULL THEN json_build_object(
                            'postid', parent_post.postid,
                            'userdetailsid', parent_post.id,
                            'displayName', parent_post.displayname
                        )
                        ELSE NULL
                    END AS "parentPost"
                FROM posts p
                JOIN posttypes pt
                    ON pt.id = p.posttypeid
                LEFT JOIN filetypes ft
                    ON ft.id = p.postfiletypeid
                LEFT JOIN events e
                    ON e.id = p.eventid
                LEFT JOIN venues v
                    ON v.id = e.venueid
                JOIN LATERAL (
                    SELECT details.*
                    FROM usertoposts utp
                    JOIN userdetails details
                        ON details.id = utp.userdetailsid
                    WHERE utp.postid = p.id
                    ORDER BY utp.id
                    LIMIT 1
                ) ud
                    ON true
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
                WHERE pt.posttype IN (${Prisma.join(posttypes)})
                AND (
                    ${upcomingOnly} = false
                    OR e.eventdate >= NOW()
                )
                AND (
                    ${requireAddress} = false
                    OR v.address IS NOT NULL
                )
                ORDER BY p.id, p.createdat DESC
            ) scene_feed
            ORDER BY COALESCE(eventdate, createdat) DESC
            LIMIT ${take}
        `
    )
}

export const getSceneHubData = async (): Promise<SceneHubData> => {
    const [collabs, recommendations, openMicAndJam, mapPosts] = await Promise.all([
        getSceneRows(['collab'], { take: 8 }),
        getSceneRows(['recommendation'], { take: 8 }),
        getSceneRows(['openmic', 'jam'], { upcomingOnly: true, take: 10 }),
        getSceneRows([...SCENE_COMMUNITY_POST_TYPES], { requireAddress: true, take: 12 })
    ])

    const radarPosts = [...collabs, ...recommendations, ...openMicAndJam]

    return {
        collabs,
        recommendations,
        openMicAndJam,
        mapPosts,
        trendRadar: buildTrendRadar(radarPosts)
    }
}
