'use client'

import Link from "next/link"
import User from '@/lib/models/user';
import imageUrl from '@/constants/imageUrl';
import Follow from './Follow';
import Avatar from '@/components/shared/Avatar';
import BoostedBadge from './BoostedBadge';
import { FeedRow } from "@/lib/models/initFeedRow";

export default function PostHeader(props:{postData:FeedRow, user:User, currentUserPost:boolean}) {
	const post = props.postData
	const user = props.user
	const currentUserPost = props.currentUserPost;
	const profileLabel = post.userdetails?.displayname || (post.userdetails?.handle ? `@${post.userdetails.handle}` : 'Profile');
	const avatar = (post && post.userdetails && post.userdetails.userdir && post.userdetails.avatar) ?
		`${imageUrl}/${post.userdetails.userdir}/${post.userdetails.avatar}` :
		undefined;

    return (
		<div className='flex items-center gap-3 pt-1'>
			<Link href={`/user/${post.userdetails?.handle}`} title={`${profileLabel}'s profile`} className='flex min-w-0 flex-1 items-center gap-3'>
				<Avatar imageUrl={avatar} displayName={post.userdetails?.displayname} handle={post.userdetails?.handle} size="md" />
				<div className='min-w-0'>
					<div className='flex items-center gap-2'>
						<div className='truncate font-bold text-lvartsmusic-foreground'>{profileLabel}</div>
						{post.isboosted && <BoostedBadge/>}
					</div>
					<div className='truncate text-sm text-lvartsmusic-muted'>
						{post.userdetails?.handle && post.userdetails?.displayname && <span>@{post.userdetails.handle}</span>}
					</div>
				</div>
			</Link>
			{!currentUserPost &&
				<Follow followinguserdetailsid={post.userdetails?.id} user={user}/>
			}
		</div>
    )
}
