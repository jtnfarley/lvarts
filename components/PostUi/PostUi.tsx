'use client'

import { useState } from 'react';
import Link from 'next/link';
// import {APIProvider} from '@vis.gl/react-google-maps';
import Post from '@/lib/models/post';
import User from '@/lib/models/user';

import PostHeader from './PostHeader';
import PostContent from './PostContent';
import PostActions from './PostActions';
import PostMedia from './PostMedia';

export default function PostUi(props:{postData:Post, user:User}) {
	const [post, setPost] = useState<Post>(props.postData)
	const user = props.user

	const currentUserParentPost = (post.parentPost && post.parentPost.userId === user?.id)
	const currentUserPost = (post.userId === user?.id)

    return (
		<div>
		{/* <APIProvider apiKey={process.env.GOOGLE_MAPS || ''} onLoad={() => console.log('Maps API has loaded.')}> */}
			<div className='text-sm pb-2 italic md:text-white'>
				{post.postType === 'comment' && 
					<Link href={`/post/${post.parentPostId}`}>commenting on {(currentUserParentPost) ? 'your' : `${post.parentPost?.userDetails?.displayName}'s`} post</Link>
				}
			</div>

			<div key={post.id} className="flex flex-col gap-2 border-1 border-gray-4 rounded-2xl bg-white">
				<PostHeader postData={post} user={user} currentUserPost={currentUserPost}/>
				<PostContent postData={post}/>
				<PostMedia post={post}/>
				<div className='grid grid-flow-col grid-rows-1 px-4 py-4'>
					<PostActions postData={post} user={user} currentUserPost={currentUserPost}/>
				</div>
			</div>
		{/* </APIProvider>			 */}
		</div>
    )
}