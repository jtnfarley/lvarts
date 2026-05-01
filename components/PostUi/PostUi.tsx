'use client'

import { useState } from 'react';
import Link from 'next/link';
import Post from '@/lib/models/post';
import User from '@/lib/models/user';

import PostHeader from './PostHeader';
import PostContent from './PostContent';
import PostActions from './PostActions';

export default function PostUi(props:{postData:Post, user:User, googleMapsApiKey:string | undefined}) {
	const post = props.postData;
	const user = props.user;

	const currentUserParentPost = (post.parentPost && post.parentPost.userId === user?.id);
	const currentUserPost = (post.userId === user?.id);

    return (
		<div>
			<div className='text-sm pb-2 italic md:text-fray-700'>
				{post.postType === 'comment' && 
					<Link href={`/post/${post.parentPostId}`}>commenting on {(currentUserParentPost) ? 'your' : `${post.parentPost?.userDetails?.displayName}'s`} post</Link>
				}
			</div>

			<div key={post.id} className="rounded-box">
				<PostHeader postData={post} user={user} currentUserPost={currentUserPost}/>
				<PostContent post={post} googleMapsApiKey={props.googleMapsApiKey}/>
				<div className='grid grid-flow-col grid-rows-1 px-4 py-4'>
					<PostActions postData={post} user={user} currentUserPost={currentUserPost}/>
				</div>
			</div>		
		</div>
    )
}