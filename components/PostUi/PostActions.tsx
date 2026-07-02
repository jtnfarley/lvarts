'use client'

import User from '@/lib/models/user';
import { FeedRow } from '@/lib/models/initFeedRow';

import LikePost from './LikePost';
import DeletePost from './DeletePost';
import EditPost from './EditPost';
import CommentButton from './CommentButton';

export default function PostActions(props:{postData:FeedRow, user:User, currentUserPost:boolean}) {
	const post = props.postData;
	const user = props.user;
	const currentUserPost = props.currentUserPost;

    return (
		<div className='flex items-center justify-between'>
			<div className='flex items-center gap-6'>
				<LikePost postData={post} user={user} currentUserPost={currentUserPost}/>
				<CommentButton postData={post}/>
			</div>
			{
				currentUserPost &&
					<div className='flex items-center gap-1'>
						<EditPost postData={post}/>
						<DeletePost postData={post}/>
					</div>
			}
		</div>
    )
}
