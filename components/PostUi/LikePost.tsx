'use client'

import { useEffect, useState } from 'react';

import { likePost, unlikePost } from "@/app/actions/posts";
import User from '@/lib/models/user';
import { useLikesStore } from '@/stores/user-likes-store';

import { BiHeart, BiSolidHeart } from "react-icons/bi";
import { FeedRow } from '@/lib/models/initFeedRow';

export default function LikePost(props:{postData:FeedRow, user:User, currentUserPost:boolean}) {
	const post:FeedRow = props.postData
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
		<button
			onClick={() => {(!currentUserPost) ? togglePostLike() : ''}}
			className={`group flex items-center gap-2 transition-colors ${postIsLikedByUser ? 'text-rose-500' : 'text-lvartsmusic-muted hover:text-rose-500'}`}
		>
			<span className='rounded-full p-2 transition-colors group-hover:bg-rose-500/10'>
				{postIsLikedByUser ? <BiSolidHeart className="h-4.5 w-4.5" /> : <BiHeart className="h-4.5 w-4.5" />}
			</span>
			<span className='text-sm'>{postLikeCount}</span>
		</button>
    )
}