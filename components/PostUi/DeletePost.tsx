'use client'

import { BiTrash } from "react-icons/bi";
import { useModal } from '@/app/contextProviders/modalProvider'
import { FeedRow } from '@/lib/models/initFeedRow';

export default function DeletePost(props:{postData:FeedRow}) {
	const post:FeedRow = props.postData
	const {
        setIsOpen, 
        setTitle, 
        setType,   
        setMessage,
        setPostContent,
        setAction,
		setActionData
    } = useModal()

	const setUpModal = () => {
		setIsOpen(true);
    setTitle('Delete Post');
    setType('PostModal');  
    setMessage('Are you sure you want to delete this post?');
    setPostContent(post.content);
    setAction('deleteThisPost');
		setActionData({postid: post.id});
	}

    return (
		<>
			<div className='text-2xl'>
				<button onClick={setUpModal}>
					<div className='text-2xl'><BiTrash /></div>
				</button>
				
			</div>
		</>
    )
}