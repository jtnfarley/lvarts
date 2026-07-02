'use client'

import {APIProvider} from '@vis.gl/react-google-maps';
import { useState } from 'react';
import User from '@/lib/models/user';
import PostUi from '@/components/PostUi/PostUi';
import type { FeedRow } from '@/lib/models/initFeedRow';

export default function Search(props:{query:string, user:User, posts:FeedRow[], googleMapsApiKey:string}) {
    const {query, user, googleMapsApiKey} = props;
    const [posts, setPosts] = useState<FeedRow[] | undefined>(props.posts)
    const [renderKey, setRenderKey] = useState(0);

	return (
		<>
            {googleMapsApiKey &&
                <APIProvider apiKey={googleMapsApiKey || ''}>
                    {user && 
                        posts &&
                        <div className="flex flex-col gap-5 py-3">
                            <div className='lvartsmusic-card text-2xl font-bold px-3 py-3 flex justify-center'>
                                #{query.toString()}
                            </div>
                            {
                                (user && posts && posts.length) &&
                                    posts.map((post:FeedRow, index:number) => {
                                        return (
                                            <PostUi key={`${post.id}-${renderKey}-${index}`} postData={post} user={user} googleMapsApiKey={googleMapsApiKey} />
                                        )
                                    })
                                }
                        </div>
                    }
                </APIProvider>
            }
		</>
	);
}
