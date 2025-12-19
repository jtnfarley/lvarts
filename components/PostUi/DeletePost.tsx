'use client'

import { useState } from 'react';

import { deletePost } from "@/app/actions/posts";
import Post from '@/lib/models/post';
import User from '@/lib/models/user';

import { BiTrash } from "react-icons/bi";
import PostModal from '../Modal/PostModal';

export default function DeletePost(props:{postData:Post, user:User}) {
	const post:Post = props.postData
	const user = props.user

	const [showDeleteModal, setShowDeleteModal] = useState(false)

	const deleteThisPost = async () => {
		const response = await deletePost(post.id)
		if (response) {
			setShowDeleteModal(false)
			window.dispatchEvent(new CustomEvent("postsUpdated", {
				detail: {
					action: `delete`,
					postId: post.id
				}
			}))
		}
	}

    return (
		<div className='text-2xl'>
			<button onClick={() => setShowDeleteModal(true)}>
				<div className='text-2xl'><BiTrash /></div>
			</button>
			{
				showDeleteModal &&
				<PostModal
					title="Delete Post"
					message="Are you sure you want to delete this post?"
					postContent={post.content}
					isOpen={showDeleteModal}
					onConfirm={deleteThisPost}
					onClose={() => setShowDeleteModal(false)}
				/>
			}
		</div>				
    )
}