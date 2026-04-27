import type SidebarProfile from '@/lib/models/sidebarProfile'
import type UserDetails from '@/lib/models/userDetails'
import { prisma } from '@/prisma'

export const getSidebarProfile = async (userId:string): Promise<SidebarProfile | null> => {
    const [profile, postCount] = await prisma.$transaction([
        prisma.userDetails.findFirst({
            where: {
                userId
            },
            select: {
                userId: true,
                displayName: true,
                avatar: true,
                userDir: true,
                followers: true,
                following: true,
                bio: true,
                urls: true
            }
        }),
        prisma.posts.count({
            where: {
                userId,
                postType: {
                    not: 'chat'
                }
            }
        })
    ])

    if (!profile) {
        return null
    }

    return {
        ...profile,
        postCount
    }
}

export const getUserDetailsWithPosts = async (userId:string): Promise<UserDetails | null> => {
    const [userDetails, postCount] = await prisma.$transaction([
        prisma.userDetails.findFirst({
            omit: {
                postIds: true
            },
            where: {
                userId
            },
            include: {
                posts: {
                    where: {
                        postType: {
                            not: 'chat'
                        }
                    },
                    include: {
                        parentPost: true,
                        userDetails: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 20
                }
            }
        }),
        prisma.posts.count({
            where: {
                userId,
                postType: {
                    not: 'chat'
                }
            }
        })
    ])

    if (!userDetails) {
        return null
    }

    return {
        ...userDetails,
        postCount
    }
}
