'use client'

import { useState } from 'react';
import Link from 'next/link';

import { likePost, unlikePost } from "@/app/actions/posts";
import Post from '@/lib/models/post';

import { BiComment } from "react-icons/bi";
import { FeedRow } from '@/lib/models/initFeedRow';

export default function CommentButton(props:{postData:FeedRow}) {
	const post:FeedRow = props.postData

	const [commentCount, setCommentCount] = useState<number>((post.comments) ? post.comments : 0)

    return (
		<Link href={`/post/${post.id}`} className='comment-link group flex items-center gap-2 text-lvartsmusic-muted transition-colors hover:text-sky-500'>
			<span className='rounded-full p-2 transition-colors group-hover:bg-sky-500/10'>
				<BiComment className="h-4.5 w-4.5" />
			</span>
			<span className='text-sm'>{commentCount}</span>
		</Link>
    )
}