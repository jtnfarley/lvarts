'use client'

import Link from 'next/link';
import User from '@/lib/models/user';

import PostHeader from './PostHeader';
import PostContent from './PostContent';
import PostActions from './PostActions';
import { FeedRow } from '@/lib/models/initFeedRow';

export default function PostUi(props:{postData:FeedRow, user:User, googleMapsApiKey:string | undefined}) {
	const post = props.postData;
	const user = props.user;
	const currentUserParentPost = post.parentPost?.userid === user?.id;
	const currentUserPost = (post.userdetails.id === user?.userdetails?.id);
	const parentPostLabel = currentUserParentPost
		? 'your'
		: post.parentPost?.displayName
			? `${post.parentPost.displayName}'s`
			: "someone's";

    return (
		<div className='mb-4'>
			<div className='pb-2 text-sm text-lvartsmusic-muted'>
				{post.posttype === 'comment' && post.parentPost &&
					<Link href={`/post/${post.parentPost.postid}`}>commenting on {parentPostLabel} post</Link>
				}
			</div>

			<div
				key={post.id}
				className="lvartsmusic-card flex flex-col gap-2 px-4 py-3 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
			>
				<PostHeader postData={post} user={user} currentUserPost={currentUserPost}/>
				<PostContent post={post} googleMapsApiKey={props.googleMapsApiKey}/>
				<div className='grid grid-flow-col grid-rows-1 px-4 py-4'>
					<PostActions postData={post} user={user} currentUserPost={currentUserPost}/>
				</div>
			</div>
		</div>
    )
}
