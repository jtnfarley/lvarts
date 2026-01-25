'use client'

import Post from '@/lib/models/post';
import { useEffect, useState } from 'react';
import EventUi from './Events/EventUi';

export default function Events(props:{events:Post[]}) {
	const [feed, setFeed] = useState<Array<Post>>(props.events);
	const [renderKey, setRenderKey] = useState(0);

	let updating = false, tempFeed:Post[] | undefined, 
	lastChecked:Date | undefined;

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