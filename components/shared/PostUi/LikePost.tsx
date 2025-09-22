'use client'

import { useState } from 'react';

import { likePost, unlikePost } from "@/app/actions/posts";
import Post from '@/lib/models/post';
import User from '@/lib/models/user';

import { BiHeart, BiSolidHeart } from "react-icons/bi";

export default function LikePost(props:{postData:Post, user:User}) {
	const post:Post = props.postData
	const user = props.user

	const [postIsLikedByUser, setPostIsLikedByUser] = useState<boolean>((user.userDetails?.likedPosts.includes(post.id)) ? true : false)

	const [postLikeCount, setPostLikeCount] = useState<number>((post.likes) ? post.likes : 0)

	const togglePostLike = async () => {
		if (postIsLikedByUser) {
			await unlikePost(post.id, user.id)
			setPostIsLikedByUser(false)
			setPostLikeCount(postLikeCount - 1)
			return
		}
		await likePost(post.id, user.id)
		setPostIsLikedByUser(true)
		setPostLikeCount(postLikeCount + 1)
	}

    return (
		<div className='grid grid-flow-col grid-rows-1 w-3'>
			<div className='text-2xl'>
				<button onClick={() => {(post.userId !== user.id) ? togglePostLike() : togglePostLike()}}>
					{(postIsLikedByUser) ?
						<BiSolidHeart className='text-red-600'/>
						:
						<BiHeart/>
					}
				</button>
			</div>
			<div className='text-sm'>{postLikeCount}</div>
		</div>
						
    )
}