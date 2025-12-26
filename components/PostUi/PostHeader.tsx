'use client'

import Post from '@/lib/models/post';
import User from '@/lib/models/user';
import imageUrl from '@/constants/imageUrl';
import Follow from './Follow';

export default function PostHeader(props:{postData:Post, user:User, currentUserPost:boolean}) {
	const post = props.postData
	const user = props.user
	const currentUserPost = props.currentUserPost;
	const avatar = (post && post.userDetails && post.userDetails.userDir && post.userDetails.avatar) ?
		`${imageUrl}/${post.userDetails.userDir}/${post.userDetails.avatar}` :
		'/images/melty-man.png';

    return (
		<div className='flex flex-row px-3 py-3 shadow-md rounded-2xl'>
			<div className='flex flex-row gap-3'>
				<div><img src={avatar} className='rounded-full w-[50px] h-[50px]'/></div>
				<div>
					<div className='text-sm font-bold'><a href={`/user/${post.user?.id}`} title={`${post.userDetails?.displayName}'s profile`}>{post.userDetails?.displayName}</a></div>
					<div className='text-[10px]'>{post.createdAt.toDateString()}</div>
				</div>
			</div>
			{!currentUserPost && 
				<Follow followUserId={post.userId} user={props.user}/>
			}
		</div>		
    )
}