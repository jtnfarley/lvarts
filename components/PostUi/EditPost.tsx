'use client'

import Post from '@/lib/models/post';
import { BiEdit } from "react-icons/bi";
import Link from 'next/link';

export default function EditPost(props:{postData:Post}) {
	const post:Post = props.postData

    return (
		<div className='text-2xl'>
			<Link href={`/edit-post/${post.id}`}>
				<div className='text-2xl'><BiEdit /></div>
			</Link>
		</div>			
    )
}