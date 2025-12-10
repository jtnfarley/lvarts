'use client'

import { useState } from 'react';
import Link from 'next/link';
import Post from '@/lib/models/post';
import User from '@/lib/models/user';

import { BiEdit, BiComment } from "react-icons/bi";

import Follow from './Follow';

export default function PostHeader(props:{postData:Post, user:User, currentUserPost:boolean}) {
	const post = props.postData
	const user = props.user
	const currentUserPost = props.currentUserPost;

    return (
		<div className='flex flex-row px-3 py-3 shadow-md rounded-2xl'>
			<div className='flex flex-row gap-3'>
				<div><img src='/images/melty-man.png' style={{width:'50px', height:'50px'}}/></div>
				<div>
					<div className='text-sm font-bold'>{post.userDetails?.displayName}</div>
					<div className='text-[10px]'>{post.createdAt.toDateString()}</div>
				</div>
			</div>
			{!currentUserPost && 
				<Follow followUserId={post.userId} user={props.user}/>
			}
		</div>		
    )
}