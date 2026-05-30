import { Prisma } from '@prisma/client'
import {prisma} from '@/prisma'
import UserDetails from '@/lib/models/userDetails'
import { generateUniqueHandle, resolveHandle } from './handles'
import { normalizeHandle } from '@/lib/handles'
import User from '@/lib/models/user'

export interface UpdateUserParams {
    id?: number
    userid: number
    handle?: string
    biolexical?: string
	biohtml?: string
    displayname?: string
    avatar?: string
    userdir?: string
    urls: {
        urlname: string,
        url: string
    }[]
    urlsUpdated: boolean
}

export const updateUser = async ({
    id,
    userid,
    handle,
    biolexical,
    biohtml,
    displayname,
    avatar,
    userdir,
    urls,
    urlsUpdated
}:UpdateUserParams): Promise<UserDetails> => {
    const date = new Date()
    const createdat = date
    const updatedat = date

    let userdetails: UserDetails;
    try {
        const existingUserDetails = id === undefined
            ? null
            : await prisma.userdetails.findFirst({
                where: {
                    id
                },
                select: {
                    id: true,
                    userid: true,
                    handle: true
                }
            })

        if (existingUserDetails && existingUserDetails.userid !== userid) {
            throw new Error('Cannot update another user profile.')
        }

        const normalizedRequestedHandle = handle ? normalizeHandle(handle) : undefined
        const resolvedHandle = existingUserDetails?.handle
            ? existingUserDetails.handle
            : await resolveHandle({
                requestedHandle: normalizedRequestedHandle || await generateUniqueHandle(userid),
                excludeUserId: userid
            })

        if (
            existingUserDetails?.handle &&
            normalizedRequestedHandle &&
            normalizedRequestedHandle !== existingUserDetails.handle
        ) {
            throw new Error('Handles can only be set once and cannot be changed.')
        }

        if (existingUserDetails) {
            userdetails = await prisma.userdetails.update({
                where: {
                    id: existingUserDetails.id
                },
                data: {
                    ...(!existingUserDetails.handle ? { handle: resolvedHandle } : {}),
                    biolexical,
                    biohtml,
                    displayname,
                    updatedat,
                    ...(avatar !== undefined ? { avatar } : {}),
                    ...(userdir ? { userdir } : {})
                }
            })
        } else {
            userdetails = await prisma.userdetails.create({
                data: {
                    User: {
                        connect: { id: userid }
                    },
                    handle: resolvedHandle,
                    biolexical,
                    biohtml,
                    displayname,
                    avatar,
                    userdir,
                    createdat,
                    updatedat,
                }
            })
        }

        if (urlsUpdated) {
            await prisma.userdetailsurls.deleteMany({
                where: {
                    userdetailsid: userdetails.id
                }
            })
            
            for (const url of urls || []) {
                if (url.url === '') continue;

                await prisma.userdetailsurls.create({
                    data: {
                        userdetailsid: userdetails.id,
                        url: url.url,
                        urlname: url.urlname
                    }
                })
            }
        }

        return userdetails;

        // if (path === '/profile/edit') revalidatePath(path)
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        throw new Error(`Failed to update user: ${message}`)
    }   
}

interface FollowUserParams {
    userdetailsid: number,
    followinguserdetailsid: number
}

const hasValidFollowUsers = async ({userdetailsid, followinguserdetailsid}: FollowUserParams) => {
    if (
        !Number.isInteger(userdetailsid) ||
        !Number.isInteger(followinguserdetailsid) ||
        userdetailsid <= 0 ||
        followinguserdetailsid <= 0 ||
        userdetailsid === followinguserdetailsid
    ) {
        return false
    }

    const users = await prisma.userdetails.findMany({
        where: {
            id: {
                in: [userdetailsid, followinguserdetailsid]
            }
        },
        select: {
            id: true
        }
    })

    return users.length === 2
}

export const followUserDAL = async ({userdetailsid, followinguserdetailsid}:FollowUserParams): Promise<boolean> => {
    if (!await hasValidFollowUsers({ userdetailsid, followinguserdetailsid })) {
        return false
    }

    const alreadyFollowing = await prisma.followers.findFirst({
        where: {
            userdetailsid, 
            followinguserdetailsid
        }
    })

    if (alreadyFollowing) return true;

    try {
        await prisma.$transaction(async (tx) => {
            await tx.followers.create({
                data: {
                    userdetailsid,
                    followinguserdetailsid
                }
            })

            const noti = await tx.notifications.create({
                data: {
                   notificationtypeid: 3,
                   read: false,
                   createdat: new Date()
                }
            })

            await tx.userstonotifications.create({
                data: {
                    notificationid: noti.id,
                    senderuserdetailsid: userdetailsid,
                    receiveruserdetailsid: followinguserdetailsid
                }
            })
        })
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            (error.code === 'P2002' || error.code === 'P2003')
        ) {
            return false
        }

        throw error
    }

    return true
}

export const unfollowUserDAL = async ({userdetailsid, followinguserdetailsid}:FollowUserParams): Promise<boolean> => {
    if (!await hasValidFollowUsers({ userdetailsid, followinguserdetailsid })) {
        return false
    }

    await prisma.followers.deleteMany({
        where: {
            userdetailsid, 
            followinguserdetailsid
        }
    })

    return true
}


export const getUserFollowsDAL = async (userdetailsid:number) => {
    const following = await prisma.followers.findMany({
        where: {
            userdetailsid
        },
        select: {
            followinguserdetailsid: true
        }
    })

    const followers = await prisma.followers.findMany({
        where: {
            followinguserdetailsid: userdetailsid
        },
        select: {
            userdetailsid: true
        }
    })

    return {
        followers: followers.map(follower => follower.userdetailsid),
        following: following.map(following => following.followinguserdetailsid)
    }
}

export const getUserLikesDAL = async (userdetailsid:number) => {
    const postids = await prisma.postlikes.findMany({
        where: {
            userdetailsid
        },
        select: {
            postid: true
        }
    })

    return postids.map(postid => postid.postid)
}

export const getUserDAL = async (handle:string): Promise<UserDetails | null> => {
    const user = await prisma.userdetails.findFirst({
        where: {
            handle
        }
    })

    if (!user) {
        return null
    }

    return user;
}

export const getUserDetailsDAL = async (userid:number): Promise<UserDetails | null> => {
    const userdetails = await prisma.userdetails.findFirst({
        where: {
            userid
        }
    })

    if (!userdetails) {
        return null
    }

    return userdetails;
}

export const getUserDetailsByHandleDAL = async (handle:string): Promise<UserDetails | null> => {
    const userdetails = await prisma.userdetails.findFirst({
        where: {
            handle
        }
    })

    if (!userdetails) {
        return null
    }

    return userdetails;
}
