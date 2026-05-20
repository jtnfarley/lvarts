import {currentUser} from "@/app/data/currentUser";
import Search from '@/components/Search';
import { searchPosts } from '@/app/data/posts';
import type { FeedRow } from '@/lib/models/initFeedRow';

export default async function SearchPage({
  params,
}: {
  params: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const user = await currentUser();

    const { query } = await params;

    const googleMapsApiKey = process.env.GOOGLE_MAPS; 

    let posts: FeedRow[] = [];

    if (query) { 
        posts = await searchPosts(query.toString())
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
