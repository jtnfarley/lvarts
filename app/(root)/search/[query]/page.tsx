import {currentUser} from "@/app/data/currentUser";
import { prisma } from '@/prisma';
import Post from '@/lib/models/post';
import Search from '@/components/Search';

const getPosts = async (queryString:string):Promise<Array<Post>> => {
    const posts:Array<Post> = await prisma.posts.findMany({
        where: {
            content: {
                contains: queryString
            },
            postType: {
                not: 'chat'
            }
        },
        include: {
            user:true,
            userDetails: true,
            parentPost: {
                include: {
                    userDetails: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    return posts
}

export default async function SearchPage({
  params,
}: {
  params: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const user = await currentUser();

    const { query } = await params;

    const googleMapsApiKey = process.env.GOOGLE_MAPS; 

    let posts;

    if (query) { 
        posts = await getPosts(query.toString())
    }

	return (
		<>
            {googleMapsApiKey &&
                <div className="flex flex-col gap-5 py-3">
                    {user && 
                        posts &&
                        <Search query={query?.toString() || ''} user={user} posts={posts} googleMapsApiKey={googleMapsApiKey}/>
                    }
                </div>
            }
		</>
	);
}
