'use client'

import { useState, useEffect } from 'react';

import { editPost } from "@/app/actions/posts";
import Post from '@/lib/models/post';
import User from '@/lib/models/user';

import { BiEdit } from "react-icons/bi";
import EditPostModal from '../Modal/EditPostModal';

export default function EditPost(props:{postData:Post, user:User}) {
	const post:Post = props.postData
	const user = props.user

	const [showEditModal, setShowEditModal] = useState(false)

	const handlePostsUpdated = (e: Event) => {
			if (showEditModal) {
				setShowEditModal(false);
			}
		}

	useEffect(() => {
		window.addEventListener('postsUpdated', handlePostsUpdated);

		return () => {
			window.removeEventListener('postsUpdated', handlePostsUpdated);
		};
	});

    return (
		<div className='text-2xl'>
			<button onClick={() => setShowEditModal(true)}>
				<div className='text-2xl'><BiEdit /></div>
			</button>
			{
				showEditModal &&
				<EditPostModal
					title="Edit Post"
					message=""
					postContent={post.lexical!}
					postId={post.id}
					isOpen={showEditModal}
					onClose={() => setShowEditModal(false)}
				/>
			}
		</div>				
    )
}