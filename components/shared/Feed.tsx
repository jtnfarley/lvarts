import { auth } from '@/auth';
import {prisma} from '@/lib/db/prisma'
import ClientFeed from './ClientFeed';
import Post from '@/lib/models/post';
import { getUserDetails } from "@/app/actions/user";

export default async function Feed() {
    const session = await auth();

    if (!session?.user || !session?.user?.id) {
        return
    }

    const user = session?.user;
    let userDetails;

	if (user.id)
		userDetails = await getUserDetails(user.id);

	if (userDetails) user.userDetails = userDetails

    const getFeed = async ():Promise<Array<Post>> => {
        'use server'
        const posts = await prisma.posts.findMany({
            where: {
                OR: [
                    { userId: session?.user?.id },
                    // { userId: {
                    //     in: session?.user?.following
                    // }},
                ]
            },
            include: {
                user:true,
                userDetails: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return posts.map(post => ({
            ...post,
            parentPostId: post.parentPostId || undefined,
            postFile: post.postFile || undefined,
            postType: post.postType || undefined,
            privatePost: post.privatePost || undefined,
            tempFile: post.tempFile || undefined,
            userDir: post.userDir || undefined,
            chatId: post.chatId || undefined,
            userDetailsId: post.userDetailsId || undefined,
            likes: post.likes || 0
        }))
    }

    let feed:Array<Post> = await getFeed()

    return (
        <ClientFeed feed={feed} getFeed={getFeed} user={user}/>
    )
}