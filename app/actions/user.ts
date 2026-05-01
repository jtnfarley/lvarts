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

    const followedUser = await prisma.userDetails.findFirst({
        where: {
            userId: toFollowId
        }
    })

    if (!followedUser) return;

    const followers = followedUser.followers
    if (followers.includes(user.id)) return

    followers.push(user.id)

    await prisma.userDetails.update({
        where: {
            id: followedUser.id
        },
        data: {
            followers
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

    const unfollowedUser = await prisma.userDetails.findFirst({
        where: {
            userId: toFollowId
        }
    })

    if (!unfollowedUser) return;

    const followers = unfollowedUser.followers
    if (!followers.includes(user.id)) return

    const ufIndex = followers.indexOf(user.id)
    followers.splice(ufIndex, 1)
    if (ufIndex === -1) return

    await prisma.userDetails.update({
        where: {
            id: unfollowedUser.id
        },
        data: {
            followers
        }
    })
}
