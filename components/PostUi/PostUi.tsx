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
		<div>
			<div className='text-sm pb-2 italic text-white'>
				{post.posttype === 'comment' && post.parentPost &&
					<Link href={`/post/${post.parentPost.postid}`}>commenting on {parentPostLabel} post</Link>
				}
			</div>

			<div key={post.id} className="rounded-box bg-[#fcf9ef]">
				<PostHeader postData={post} user={user} currentUserPost={currentUserPost}/>
				<PostContent post={post} googleMapsApiKey={props.googleMapsApiKey}/>
				<div className='grid grid-flow-col grid-rows-1 px-4 py-4'>
					<PostActions postData={post} user={user} currentUserPost={currentUserPost}/>
				</div>
			</div>		
		</div>
    )
}
