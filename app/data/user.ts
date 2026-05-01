import {prisma} from '@/lib/db/prisma'
import UserDetails from '@/lib/models/userDetails'
import { generateUniqueHandle, resolveHandle } from './handles'

export interface UpdateUserParams {
    id?: string,
    userId: string,
    handle?: string,
    bio?: string,
    displayName?: string,
    avatar?: string
    userDir?: string,
    urls: string[]
}

export const updateUser = async ({
    id,
    userId,
    handle,
    bio,
    displayName,
    avatar,
    userDir,
    urls
}:UpdateUserParams): Promise<UserDetails> => {
    const date = new Date()
    const createdAt = date
    const updatedAt = date

    let userDetails: UserDetails;
    try {
        const existingUserDetails = id
            ? await prisma.userDetails.findFirst({
                where: {
                    id
                },
                select: {
                    handle: true
                }
            })
            : null
        const resolvedHandle = await resolveHandle({
            requestedHandle: handle || existingUserDetails?.handle || await generateUniqueHandle(userId),
            excludeUserId: userId
        })

        if (id) {
            userDetails = await prisma.userDetails.update({
                where: {
                    id: id
                },
                data: {
                    handle: resolvedHandle,
                    bio,
                    displayName,
                    updatedAt,
                    urls,
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
                    handle: resolvedHandle,
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
                    postIds: [],
                    urls
                }
            })
        }

        return userDetails;

        // if (path === '/profile/edit') revalidatePath(path)
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        throw new Error(`Failed to update user: ${message}`)
    }   
}
