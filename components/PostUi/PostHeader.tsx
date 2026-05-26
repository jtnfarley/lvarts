'use client'

import Link from "next/link"
import User from '@/lib/models/user';
import imageUrl from '@/constants/imageUrl';
import Follow from './Follow';
import { FeedRow } from "@/lib/models/initFeedRow";

export default function PostHeader(props:{postData:FeedRow, user:User, currentUserPost:boolean}) {
	const post = props.postData
	const user = props.user
	const currentUserPost = props.currentUserPost;
	const profileLabel = post.userdetails?.displayname || (post.userdetails?.handle ? `@${post.userdetails.handle}` : 'Profile');
	const avatar = (post && post.userdetails && post.userdetails.userdir && post.userdetails.avatar) ?
		`${imageUrl}/${post.userdetails.userdir}/${post.userdetails.avatar}` :
		'/images/melty-man.png';

    return (
		<div className='flex flex-row xl:px-3 pt-3'>
			<Link href={`/user/${post.userdetails?.handle}`} title={`${profileLabel}'s profile`} className='flex flex-row gap-3'>
				<div><img src={avatar} className='rounded-md border-2 border-orange-300 w-[60px] h-[60px]'/></div>
				<div>
					<div className='text-lg font-bold'>{profileLabel}</div>
					<div className='text-sm sm:text-md'>
						{post.userdetails?.handle && post.userdetails?.displayname && <span>@{post.userdetails.handle}</span>}
					</div>
					{/* <div className='text-xs'>{post.createdat.toDateString()}</div> */}
				</div>
			</Link>
			{!currentUserPost && 
				<Follow followinguserdetailsid={post.userdetails?.id} user={user}/>
			}
		</div>		
    )
}
