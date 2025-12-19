'use server'

import {prisma} from '@/lib/db/prisma';
import User from '@/lib/models/user';
import Post from '@/lib/models/post';

export const getFeed = async (user:User, lastChecked:Date | undefined):Promise<Array<Post>> => {
    const posts:Array<Post> = await prisma.posts.findMany({
        where: {
            OR: [
                { userId: user?.id },
                { userId: {
                    in: user?.userDetails?.following
                }},
            ],
            createdAt: {
                gt: lastChecked
            }
        },
        // include,
        orderBy: {
            createdAt: 'desc'
        },
        take: 20
    })

    return posts
}