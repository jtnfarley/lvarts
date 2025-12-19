'use server'

import {prisma} from '@/lib/db/prisma'
import User from '@/lib/models/user'
import UserDetails from '@/lib/models/userDetails'

interface UpdateUserParams {
    id?: string,
    userId: string,
    bio?: string,
    displayName?: string,
    avatar?: string
    userDir?: string
}

interface FollowUserParams {
    userId: string,
    toFollowId: string
}

export const getUserDetails = async (userId:string) => {
    const userDetails = await prisma.userDetails.findFirst({
        where: {
            userId
        }
    })

    return userDetails
}

export const getRandoUsers = async (userId:string):Promise<UserDetails[]> => {
    const userDetailsCount = await prisma.userDetails.count();
    if (userDetailsCount) {
        const skip = Math.floor(Math.random() * (userDetailsCount - 1)); //remove logged-in user
        const userDetails = await prisma.userDetails.findMany({
            take: 5,
            // skip: skip,
            where: {
                userId: {
                    not: userId
                }
            }
        });

        return userDetails
    }

    return [];
}

export const updateUser = async ({
    id,
    userId,
    bio,
    displayName,
    avatar,
    userDir
}:UpdateUserParams): Promise<UserDetails> => {
    const date = new Date()
    const createdAt = date
    const updatedAt = date

    let userDetails;
    try {
        if (id) {
            userDetails = await prisma.userDetails.update({
                where: {
                    id: id
                },
                data: {
                    bio,
                    displayName,
                    updatedAt,
                    ...(avatar !== undefined ? { avatar } : {}),
                    ...(userDir ? { userDir } : {})
                }
            })
        } else {
            userDetails = await prisma.userDetails.create({
                data: {
                    user: {
                        connect: { id: userId }
                    },
                    bio,
                    displayName,
                    avatar,
                    userDir,
                    createdAt,
                    updatedAt,
                    chats: [],
                    comments: [],
                    followers: [],
                    following: [],
                    likedPosts: [],
                    postIds: []
                }
            })
        }

        return userDetails;

        // if (path === '/profile/edit') revalidatePath(path)
    } catch (error:any) {
        console.log(error)
        throw new Error(`Failed to update user: ${error.message}`)
    }   
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

    const noti = await prisma.notifications.create({
        data: {
            createdAt: new Date(),
            type: 'follow',
            read: false,
            userId: toFollowId, 
            notiUserId: userId
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
