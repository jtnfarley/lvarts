'use server'

import {prisma} from '@/lib/db/prisma'
import User from '@/lib/models/user'
import UserDetails from '@/lib/models/userDetails'

interface UpdateUserParams {
    id: string,
    userId: string,
    bio?: string,
    displayName?: string,
    avatarUrl?: string
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
    const skip = Math.floor(Math.random() * (userDetailsCount - 1)); //remove logged-in user
    const userDetails = await prisma.userDetails.findMany({
        take: 5,
        skip: skip,
        where: {
            userId: {
                not: userId
            }
        }
    });

    return userDetails
}

export const updateUser = async ({
    id,
    userId,
    bio,
    displayName
}:UpdateUserParams): Promise<void> => {
console.log(id, userId,
    bio,
    displayName)
    const date = new Date()
    const createdAt = date
    const updatedAt = date

    try {
        if (id) {
            await prisma.userDetails.update({
                where: {
                    id: id
                },
                data: {
                    bio,
                    displayName,
                    updatedAt
                }
            })
        } else {
            await prisma.userDetails.create({
                data: {
                    userId,
                    bio,
                    displayName,
                    createdAt,
                    updatedAt
                }
            })
        }

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