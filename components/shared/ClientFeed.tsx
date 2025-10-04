'use client'

import Post from '@/lib/models/post';
import User from '@/lib/models/user';
import { useCallback, useEffect, useState } from 'react';
import PostUi from './PostUi/PostUi';

export default function ClientFeed(props:{feed:Array<Post>, getFeed:Function, user:User}) {
	const [updatedFeed, setUpdatedFeed] = useState<Array<Post>>(props.feed)
	const [renderKey, setRenderKey] = useState(0)

	const handlePostsUpdated = async () => {
		const feedArr = await props.getFeed()
		setUpdatedFeed(feedArr)
		setRenderKey(prev => prev + 1)
	}

	useEffect(() => {
		window.addEventListener("postsUpdated", handlePostsUpdated)

		return () => {
			window.removeEventListener("postsUpdated", handlePostsUpdated)
		}
	})

    return (
        <div className="flex flex-col gap-5">
            {
				(updatedFeed.length) &&
                	updatedFeed.map((post:Post, index:number) => {
						return (
							<PostUi key={`${post.id}-${renderKey}-${index}`} postData={post} user={props.user} />
						)
					})
				}
        </div>
    )
}