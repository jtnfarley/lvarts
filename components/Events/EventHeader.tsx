'use client'

import Post from '@/lib/models/post';
import User from '@/lib/models/user';
import imageUrl from '@/constants/imageUrl';
import { formatDate } from '@/lib/utils';

export default function EventHeader(props:{post:Post}) {
	const post = props.post;

	const avatar = (post && post.userDetails && post.userDetails.userDir && post.userDetails.avatar) ?
		`${imageUrl}/${post.userDetails.userDir}/${post.userDetails.avatar}` :
		'/images/melty-man.png';

    return (
		<div className='flex flex-row px-3 py-3'>
			<div className='flex flex-row gap-3'>
				{/* <div><img src={avatar} className='rounded-full w-[50px] h-[50px]'/></div> */}
				<div>
					<div className='text-2xl font-bold'>
						<a href={`/event/${post.id}`} title={`${post.eventTitle}`}>
							{post.eventTitle}
						</a>
					</div>
					<div className=''>{formatDate(post.eventDate)}</div>
				</div>
			</div>
		</div>		
    )
}