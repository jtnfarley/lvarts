'use client'

import { BiEdit } from "react-icons/bi";
import Link from 'next/link';
import { FeedRow } from '@/lib/models/initFeedRow';

export default function EditPost(props:{postData:FeedRow}) {
	const post:FeedRow = props.postData

    return (
		<Link href={`/edit-post/${post.id}`} className='rounded-full p-2 text-lvartsmusic-muted transition-colors hover:bg-black/5 hover:text-lvartsmusic-foreground dark:hover:bg-white/10'>
			<BiEdit className="h-4.5 w-4.5" />
		</Link>
    )
}