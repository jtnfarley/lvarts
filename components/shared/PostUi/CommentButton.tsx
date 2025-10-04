'use client'

import { useState } from 'react';
import Link from 'next/link';

import { likePost, unlikePost } from "@/app/actions/posts";
import Post from '@/lib/models/post';

import { BiComment } from "react-icons/bi";

export default function CommentButton(props:{postData:Post}) {
	const post:Post = props.postData

	const [commentCount, setCommentCount] = useState<number>((post.commentCount) ? post.commentCount : 0)

    return (
		<div className='grid grid-flow-col grid-rows-1 w-3'>
			<div className='text-2xl'>
				<Link href={`/post/${post.id}`}>
					<BiComment/>
				</Link>
			</div>
			<div className='text-sm'>{commentCount}</div>
		</div>
						
    )
}