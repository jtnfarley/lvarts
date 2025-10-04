'use client'

import { useState } from 'react';
import Link from 'next/link';
import Post from '@/lib/models/post';
import User from '@/lib/models/user';

import PostHeader from './PostHeader';
import PostActions from './PostActions';

export default function PostUi(props:{postData:Post, user:User}) {
	const [post, setPost] = useState<Post>(props.postData)

    return (
		<div>
			{post.postType === 'comment' && 
				<div className='text-sm pb-2 italic'><Link href={`/post/${post.parentPostId}`}>commenting on {post.parentPost?.userDetails?.displayName}'s post</Link></div>
			}

			<div key={post.id} className="flex flex-col gap-2 border-1 border-gray-4 rounded-2xl">
				<PostHeader postData={post} user={props.user}/>
				{
					// post.postFile &&
					// 	<div className='px-4 py-4'>
					// 		<img src={post.postFile} style={{width:'100%', height:'auto'}}/>
					// 	</div>
				}
				<div className='px-4 pb-4 pt-3'>
					<div>{post.content}</div>
					<div className='text-sm pt-2 italic text-gray-1'>{(post.edited) ? 'edited' : ''}</div>
				</div>
				<div className='grid grid-flow-col grid-rows-1 px-4 py-4'>
					<PostActions postData={post} user={props.user}/>
				</div>
			</div>
		</div>			
    )
}