import {prisma} from '@/lib/db/prisma'
import UserDetails from '@/lib/models/userDetails'
import { generateUniqueHandle, resolveHandle } from './handles'
import { normalizeHandle } from '@/lib/handles'

export interface UpdateUserParams {
    id?: string,
    userId: string,
    handle?: string,
    bioLexical?: string
	bioHtml?: string,
    displayName?: string,
    avatar?: string
    userDir?: string,
    urls: string[]
}

export const updateUser = async ({
    id,
    userId,
    handle,
    bioLexical,
    bioHtml,
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
        const existingUserDetails = await prisma.userDetails.findFirst({
            where: id ? { id } : { userId },
            select: {
                id: true,
                userId: true,
                handle: true
            }
        })

        if (existingUserDetails && existingUserDetails.userId !== userId) {
            throw new Error('Cannot update another user profile.')
        }

        const normalizedRequestedHandle = handle ? normalizeHandle(handle) : undefined
        const resolvedHandle = existingUserDetails?.handle
            ? existingUserDetails.handle
            : await resolveHandle({
                requestedHandle: normalizedRequestedHandle || await generateUniqueHandle(userId),
                excludeUserId: userId
            })

        if (
            existingUserDetails?.handle &&
            normalizedRequestedHandle &&
            normalizedRequestedHandle !== existingUserDetails.handle
        ) {
            throw new Error('Handles can only be set once and cannot be changed.')
        }

        if (existingUserDetails) {
            userDetails = await prisma.userDetails.update({
                where: {
                    id: existingUserDetails.id
                },
                data: {
                    ...(!existingUserDetails.handle ? { handle: resolvedHandle } : {}),
                    bioLexical,
                    bioHtml,
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
                    bioLexical,
                    bioHtml,
                    displayName,
                    avatar,
                    userDir,
                    createdAt,
                    updatedAt,
                    chats: [],
                    comments: [],
                    followers: [],
                    following: ['6939e1895a3da4a39985c95a'],
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
