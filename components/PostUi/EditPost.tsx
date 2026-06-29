'use client'

import { BiEdit } from "react-icons/bi";
import Link from 'next/link';
import { FeedRow } from '@/lib/models/initFeedRow';

export default function EditPost(props:{postData:FeedRow}) {
	const post:FeedRow = props.postData

    return (
		<div className='text-2xl'>
			<Link href={`/edit-post/${post.id}`}>
				<div className='text-2xl'><BiEdit /></div>
			</Link>
		</div>			
    )
}