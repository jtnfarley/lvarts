'use client'

import type { FeedRow } from '@/lib/models/initFeedRow';
import imageUrl from '@/constants/imageUrl';
import { formatDate } from '@/lib/utils';

export default function EventHeader(props:{post:FeedRow}) {
	const post = props.post;

	const avatar = (post && post.userdetails && post.userdetails.userdir && post.userdetails.avatar) ?
		`${imageUrl}/${post.userdetails.userdir}/${post.userdetails.avatar}` :
		'/images/melty-man.png';

    return (
		<div className='flex flex-row px-3 py-3'>
			<div className='flex flex-row gap-3'>
				{/* <div><img src={avatar} className='rounded-full w-[50px] h-[50px]'/></div> */}
				<div>
					<div className='text-2xl font-bold'>
						<a href={`/event/${post.id}`} title={`${post.eventname}`}>
							{post.eventname}
						</a>
					</div>
					<div className=''>{formatDate(post.eventdate)}</div>
				</div>
			</div>
		</div>		
    )
}
