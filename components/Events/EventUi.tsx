'use client'

import { useState } from 'react';
import type { FeedRow } from '@/lib/models/initFeedRow';
import EventContent from './EventContent';

export default function EventUi(props:{post:FeedRow}) {
	const [post, setPost] = useState<FeedRow>(props.post);

    return (
		<div key={post.id} className="w-full gap-4 bg-white">
			<EventContent post={post} googleMapsApiKey={''}/>
		</div>		
    )
}
