'use client'

import type { FeedRow } from '@/lib/models/initFeedRow';
import { formatDate } from '@/lib/utils';

export default function EventHeader(props:{post:FeedRow}) {
	const post = props.post;

    return (
		<div className='flex flex-row px-3 py-5'>
			<div className='text-2xl font-bold'>
				<a href={`/event/${post.id}`} title={`${post.eventname}`}>
					{post.eventname}
				</a>
			</div>
			<div className=''>{formatDate(post.eventdate)}</div>
		</div>		
    )
}
