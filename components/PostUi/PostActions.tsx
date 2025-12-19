'use client'

import Post from '@/lib/models/post';
import User from '@/lib/models/user';

import { BiSolidUserCheck, BiUserPlus, BiSolidUserX } from "react-icons/bi";

import LikePost from './LikePost';
import DeletePost from './DeletePost';
import EditPost from './EditPost';
import CommentButton from './CommentButton';
import { useState } from 'react';

export default function PostActions(props:{postData:Post, user:User, currentUserPost:boolean}) {
	const post = props.postData;
	const user = props.user;
	const currentUserPost = props.currentUserPost;
	const [isHovered, setIsHovered] = useState(false);

    return (
		<div className='flex flex-row'>
			<div className='w-1/2 flex flex-row'>
				<div className='w-1/4'>
					<LikePost postData={post} user={props.user} currentUserPost={currentUserPost}/>
				</div>
				<div className='w-1/4'>
					<CommentButton postData={post}/>
				</div>
			</div>
			{
				currentUserPost && 
					<div className='w-1/2 flex flex-row justify-end'>
						<div className='w-1/4 flex justify-end'>
							<EditPost postData={post} user={props.user}/>
						</div>
						<div className='w-1/4 flex justify-end'>
							<DeletePost postData={post} user={props.user}/>
						</div>
					</div>					
			}
		</div>
					
    )
}