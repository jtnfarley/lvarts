import {prisma} from '@/lib/db/prisma'
import UserDetails from '@/lib/models/userDetails'

interface UpdateUserParams {
    id?: string,
    userId: string,
    bio?: string,
    displayName?: string,
    avatar?: string
    userDir?: string
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

    let userDetails: UserDetails;
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
        throw new Error(`Failed to update user: ${error.message}`)
    }   
}