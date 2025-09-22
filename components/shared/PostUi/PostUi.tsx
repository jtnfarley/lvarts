'use client'

import { useState } from 'react';
import Post from '@/lib/models/post';
import User from '@/lib/models/user';

import { BiEdit, BiComment } from "react-icons/bi";

import LikePost from './LikePost';
import DeletePost from './DeletePost';
import EditPost from './EditPost';

export default function PostUi(props:{postData:Post, getFeed:Function, user:User}) {
	const [post, setPost] = useState<Post>(props.postData)

    return (
		<div key={post.id} className="flex flex-col gap-2 border-1 border-gray-4 rounded-2xl">
			<div className='px-3 py-3 shadow-md rounded-2xl'>
				<div className='flex flex-row gap-3'>
					<div><img src='https://static01.nyt.com/images/2021/09/30/fashion/29melting-face-emoji/29melting-face-emoji-mediumSquareAt3X-v2.jpg' style={{width:'50px', height:'50px'}}/></div>
					<div>
						<div className='text-sm'>{post.userDetails?.displayName || 'Display Name'}</div>
						<div className='text-[10px]'>{post.createdAt.toDateString()}</div>
					</div>
				</div>
			</div>
			<div className='px-4 pb-4 pt-3'>
				<div>{post.content}</div>
				<div>{(post.edited) ? 'edited' : ''}</div>
			</div>
			<div className='grid grid-flow-col grid-rows-1 px-4 py-4'>
				<div className='grid grid-flow-col grid-rows-1'>
					
					<LikePost postData={post} user={props.user}/>

					<div className='grid grid-flow-col grid-rows-1 w-3'>
						<div className='text-2xl'><BiComment /></div>
						<div className='text-sm'>{post.likes}</div>
					</div>
				</div>
				<div></div>
				{
					post.userId === props.user.id && 
						<div className='grid grid-flow-col grid-rows-1 justify-items-end'>
							<EditPost postData={post} user={props.user}/>
							<DeletePost postData={post} user={props.user}/>
						</div>
				}
			</div>
		</div>
						
    )
}