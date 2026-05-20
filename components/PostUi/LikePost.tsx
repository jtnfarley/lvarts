'use client'

import { useEffect, useState } from 'react';

import { likePost, unlikePost } from "@/app/actions/posts";
import Post from '@/lib/models/post';
import User from '@/lib/models/user';
import { useLikesStore } from '@/stores/user-likes-store';

import { BiHeart, BiSolidHeart } from "react-icons/bi";

export default function LikePost(props:{postData:Post, user:User, currentUserPost:boolean}) {
	const post:Post = props.postData
	const user = props.user
	const userdetails = user.userdetails;
	const currentUserPost = props.currentUserPost;
	const [postIsLikedByUser, setPostIsLikedByUser] = useState<boolean>(false);
	const postids = useLikesStore((state) => state.postids);
	const addLike = useLikesStore((state) => state.addLike);
	const removeLike = useLikesStore((state) => state.removeLike);
	const [postLikeCount, setPostLikeCount] = useState<number>((post.likes) ? post.likes : 0)

	const togglePostLike = async () => {
		if (userdetails && userdetails.id) {
			if (postIsLikedByUser) {
				await unlikePost(post.id, userdetails.id);
				removeLike(post.id);
				setPostIsLikedByUser(false);
				setPostLikeCount(postLikeCount - 1);
				return;
			}

			await likePost(post.id, userdetails.id);
			addLike(post.id);
			setPostIsLikedByUser(true);
			setPostLikeCount(postLikeCount + 1);
		}
	}

	const setUserPostLikes = () => {
		if (postids.includes(post.id)) {
			setPostIsLikedByUser(true);
		}
	}

	useEffect(() => {
		setUserPostLikes();
	}, [postids, post])

    return (
		<div className='grid grid-flow-col grid-rows-1 w-3'>
			<div className='text-2xl'>
				<button onClick={() => {(!currentUserPost) ? togglePostLike() : ''}}>
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