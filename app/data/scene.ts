'use server'

import { Prisma } from '@prisma/client'

import { prisma } from '@/lib/db/prisma'
import type Post from '@/lib/models/post'
import { getPostTypeLabel, SCENE_COMMUNITY_POST_TYPES, splitPostTags } from '@/lib/scenePosts'

type TrendItem = {
    label: string
    count: number
}

type TrendRadar = {
    postTypes: TrendItem[]
    towns: TrendItem[]
    tags: TrendItem[]
}

export interface SceneHubData {
    collabs: Post[]
    recommendations: Post[]
    openMicAndJam: Post[]
    mapPosts: Post[]
    trendRadar: TrendRadar
}

const fullPostInclude = {
    user: true,
    userDetails: true,
    parentPost: {
        include: {
            userDetails: true
        }
    }
} satisfies Prisma.PostsInclude

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

const buildTrendRadar = (posts:Array<Pick<Post, 'postType' | 'town' | 'tags'>>): TrendRadar => {
    const postTypes = posts
        .map((post) => getPostTypeLabel(post.postType))
        .filter(Boolean)

    const towns = posts
        .map((post) => post.town || '')
        .filter(Boolean)

    const tags = posts.flatMap((post) => splitPostTags(post.tags))

    return {
        postTypes: getTopCounts(postTypes),
        towns: getTopCounts(towns),
        tags: getTopCounts(tags)
    }
}

export const getSceneHubData = async (): Promise<SceneHubData> => {
    const recentThreshold = new Date()
    recentThreshold.setDate(recentThreshold.getDate() - 14)

    const [collabs, recommendations, openMicAndJam, mapPosts, radarPosts] = await prisma.$transaction([
        prisma.posts.findMany({
            where: {
                postType: 'collab'
            },
            include: fullPostInclude,
            orderBy: {
                createdAt: 'desc'
            },
            take: 8
        }),
        prisma.posts.findMany({
            where: {
                postType: 'recommendation'
            },
            include: fullPostInclude,
            orderBy: {
                createdAt: 'desc'
            },
            take: 8
        }),
        prisma.posts.findMany({
            where: {
                postType: {
                    in: ['openmic', 'jam']
                },
                eventDate: {
                    gte: new Date()
                }
            },
            include: fullPostInclude,
            orderBy: {
                eventDate: 'asc'
            },
            take: 10
        }),
        prisma.posts.findMany({
            where: {
                postType: {
                    in: [...SCENE_COMMUNITY_POST_TYPES]
                },
                locationLabel: {
                    not: null
                }
            },
            include: fullPostInclude,
            orderBy: {
                createdAt: 'desc'
            },
            take: 12
        }),
        prisma.posts.findMany({
            where: {
                postType: {
                    in: [...SCENE_COMMUNITY_POST_TYPES]
                },
                createdAt: {
                    gte: recentThreshold
                }
            },
            select: {
                postType: true,
                town: true,
                tags: true
            }
        })
    ])

    return {
        collabs,
        recommendations,
        openMicAndJam,
        mapPosts,
        trendRadar: buildTrendRadar(radarPosts)
    }
}
