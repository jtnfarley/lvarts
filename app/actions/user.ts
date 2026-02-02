'use server'

import {prisma} from '@/lib/db/prisma'

interface FollowUserParams {
    userId: string,
    toFollowId: string
}

export const followUser = async ({userId, toFollowId}:FollowUserParams) => {
    const user = await prisma.userDetails.findFirst({
        where: {
            userId
        }
    })

    if (!user) return

    const following = user.following
    if (following.includes(toFollowId)) return

    following.push(toFollowId)

    await prisma.userDetails.update({
        where: {
            id: user.id
        },
        data: {
            following
        }
    })

    await prisma.notifications.create({
        data: {
            createdAt: new Date(),
            type: 'follow',
            read: false,
            userId: toFollowId,
            notiUserId: userId,
            notiUserDetailsId: user.id
        },
    })
}

export const unfollowUser = async ({userId, toFollowId}:FollowUserParams) => {
    const user = await prisma.userDetails.findFirst({
        where: {
            userId
        }
    })

    if (!user) return

    const following = user.following
    if (!following.includes(toFollowId)) return
    const index = following.indexOf(toFollowId)
    following.splice(index, 1)
    if (index === -1) return

    await prisma.userDetails.update({
        where: {
            id: user.id
        },
        data: {
            following: following || []
        }
    })
}
