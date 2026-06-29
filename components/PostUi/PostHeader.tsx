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
			<Link href={`/user/${post.userdetails?.handle}`} title={`${profileLabel}'s profile`} className='flex flex-row gap-3 items-center'>
				<div><img src={avatar} className='border-[3px] border-gray-600 rounded-md shadow-md shadow-gray-600 rotate-[-4deg] w-[60px] h-[60px] object-cover'/></div>
				<div>
					<div className='font-poster text-2xl uppercase tracking-wide leading-tight'>{profileLabel}</div>
					<div className='font-typewriter text-sm text-neutral-600'>
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
