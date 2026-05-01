'use client'

import Link from "next/link"
import Post from '@/lib/models/post';
import User from '@/lib/models/user';
import imageUrl from '@/constants/imageUrl';
import Follow from './Follow';

export default function PostHeader(props:{postData:Post, user:User, currentUserPost:boolean}) {
	const post = props.postData
	const user = props.user
	const currentUserPost = props.currentUserPost;
	const profileLabel = post.userDetails?.displayName || (post.userDetails?.handle ? `@${post.userDetails.handle}` : 'Profile');
	const avatar = (post && post.userDetails && post.userDetails.userDir && post.userDetails.avatar) ?
		`${imageUrl}/${post.userDetails.userDir}/${post.userDetails.avatar}` :
		'/images/melty-man.png';

    return (
		<div className='flex flex-row px-3 py-3 shadow-md rounded-2xl'>
			<Link href={`/user/${post.user?.id}`} title={`${profileLabel}'s profile`} className='flex flex-row gap-3'>
				<div><img src={avatar} className='rounded-full w-[50px] h-[50px]'/></div>
				<div>
					<div className='text-sm font-bold'>{profileLabel}</div>
					<div className='flex items-center gap-1 text-[10px]'>
						{post.userDetails?.handle && post.userDetails?.displayName && <span>@{post.userDetails.handle}</span>}
						{post.userDetails?.handle && post.userDetails?.displayName && <span>&bull;</span>}
						<div>{post.createdAt.toDateString()}</div>
					</div>
				</div>
			</Link>
			{!currentUserPost && 
				<Follow followUserId={post.userId} user={props.user}/>
			}
		</div>		
    )
}
