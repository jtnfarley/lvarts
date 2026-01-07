'use client'

import Post from '@/lib/models/post';
import User from '@/lib/models/user';

import { BiEdit } from "react-icons/bi";
import { useModal } from '@/app/contextProviders/modalProvider'

export default function EditPost(props:{postData:Post, user:User}) {
	const post:Post = props.postData
	const user = props.user
	const {
        setIsOpen, 
        setTitle, 
        setType,   
        setPostContent,
		setActionData,
		setUser
    } = useModal()

	const setUpModal = () => {
		setIsOpen(true);
        setTitle('Edit Post');
        setType('EditPostModal');  
        setPostContent(post.lexical);
		setActionData({postId: post.id});
		setUser(user);
	}

    return (
		<div className='text-2xl'>
			<button onClick={() => setUpModal()}>
				<div className='text-2xl'><BiEdit /></div>
			</button>
		</div>			
    )
}