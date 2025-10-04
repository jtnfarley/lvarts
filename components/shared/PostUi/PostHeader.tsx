'use client'

import { useState } from 'react';
import Link from 'next/link';
import Post from '@/lib/models/post';
import User from '@/lib/models/user';

import { BiEdit, BiComment } from "react-icons/bi";

import Follow from './Follow';

export default function PostHeader(props:{postData:Post, user:User}) {
	const post = props.postData
	const user = props.user

    return (
		<div className='flex flex-row px-3 py-3 shadow-md rounded-2xl'>
			<div className='flex flex-row gap-3'>
				<div><img src='https://static01.nyt.com/images/2021/09/30/fashion/29melting-face-emoji/29melting-face-emoji-mediumSquareAt3X-v2.jpg' style={{width:'50px', height:'50px'}}/></div>
				<div>
					<div className='text-sm'>{post.userDetails?.displayName}</div>
					<div className='text-[10px]'>{post.createdAt.toDateString()}</div>
				</div>
			</div>
			{user.id !== post.userId && 
				<Follow postData={post} user={props.user}/>
			}
		</div>		
    )
}