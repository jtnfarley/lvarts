'use client'

import Post from '@/lib/models/post';
import { useEffect, useState } from 'react';
import EventUi from './Events/EventUi';
import { getEvents } from '@/app/actions/posts';

export default function Events() {
	const [feed, setFeed] = useState<Array<Post>>();
	const [renderKey, setRenderKey] = useState(0);

	let updating = false, tempFeed:Post[] | undefined, 
	lastChecked:Date | undefined;

	const getEventArr = async ():Promise<Array<Post> | undefined> => {
        return await getEvents();
    }

	const handlePostsUpdated = async (ev:Event) => {
		if (updating) return //in case postsUpdated and the interval collide
		updating = true
		
		const feedArr = await getEventArr();

		// const newFeed = (feedArr && feedArr.length && tempFeed && tempFeed.length) ? [...feedArr, ...tempFeed] : (feedArr && feedArr.length) ? feedArr : tempFeed;

		setFeed(feedArr)
		// tempFeed = newFeed
		setRenderKey(prev => prev + 1)
		updating = false
	}



	useEffect(() => {
		handlePostsUpdated(new Event('postsUpdated'))
	}, [])

    return (
        <div className="flex flex-col gap-5 pb-5">
			<div className='text-xl'>Lehigh Valley Art & Music Events</div>
			<div className="lg:grid lg:grid-cols-3 md:flex md:flex-col gap-4">
				{
					(feed && feed.length) &&
						feed.map((post:Post, index:number) => {
							return (
								<EventUi key={`${post.id}-${renderKey}-${index}`} post={post} />
							)
						})
					}
			</div>
        </div>
    )
}