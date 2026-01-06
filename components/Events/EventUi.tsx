'use client'

import { useState } from 'react';
import Link from 'next/link';
import Post from '@/lib/models/post';
import PostContent from '../PostUi/PostContent';
import EventHeader from './EventHeader';

export default function EventUi(props:{post:Post}) {
	const [post, setPost] = useState<Post>(props.post);

    return (
		<div key={post.id} className="flex flex-col gap-2 border-1 border-gray-4 rounded-2xl bg-white max-w-2xl">
			<PostContent post={post} googleMapsApiKey={''}/>
		</div>		
    )
}