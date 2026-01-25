'use client'

import { useRef, useState } from 'react';
import {APIProvider} from '@vis.gl/react-google-maps';
import UserDetails from '@/lib/models/userDetails';
import Follow from '@/components/PostUi/Follow';
import User from '@/lib/models/user';
import imageUrl from '@/constants/imageUrl';
import PostUi from '@/components/PostUi/PostUi';
import Post from '@/lib/models/post';
import { LoadOldPosts } from './PostUi/LoadOldPosts';

export default function UserProfile(props:{currentUser:User, userDetails:UserDetails, getOldPosts:Function, googleMapsApiKey:string}) {
	const {currentUser, userDetails, getOldPosts, googleMapsApiKey} = props;
	const avatarUrl = `${imageUrl}/${userDetails.userDir}/${userDetails.avatar}`
	const [posts, setPosts] = useState<Post[]>(userDetails.posts || []);
	const [renderKey, setRenderKey] = useState(0);
	const tempFeedRef = useRef<Post[]>(userDetails.posts);
	const [endOfPosts, setEndOfPosts] = useState(false);

	const getOldPostsFromServer = async () => {
		const oldPosts = await getOldPosts(userDetails.userId, posts.length);
	
		if (oldPosts && oldPosts.length && tempFeedRef.current && tempFeedRef.current.length) {
			tempFeedRef.current = [...tempFeedRef.current, ...oldPosts];
			setPosts(tempFeedRef.current)
			setRenderKey(prev => prev + 1)
		} else {
			setEndOfPosts(true);
		}
	}

	return (
		<>
            {googleMapsApiKey &&
                <APIProvider apiKey={googleMapsApiKey || ''}>
					<div className="lg:bg-white lg:rounded-xl lg:p-5 sm:bg-none sm:p-0 mt-5 mb-5">
						{currentUser && userDetails && 
							<section className="flex flex-col justify-between min-h-50 rounded-box">
								<div className="mb-4 flex">
									<img src={avatarUrl || '/images/melty-man.png'} className='w-[50px] h-[50px] me-3 rounded-full'/>
									<div className='font-bold text-2xl'>{userDetails.displayName}</div>
									{
										currentUser.id !== userDetails.userId &&
											<Follow followUserId={userDetails.userId} user={currentUser}/>
									}
								</div>
								<div className="mb-4">
									{userDetails.bio}
								</div>
								<div className='flex justify-between text-sm uppercase'>
									<div>Posts: <strong>{userDetails.postIds?.length || 0}</strong></div>
									<div>Followers: <strong>{userDetails.followers.length || 0}</strong></div>
									<div>Following: <strong>{userDetails.following.length || 0}</strong></div>
								</div>
							</section>
						}
					</div>

					{userDetails && currentUser && posts &&
						<div className='flex flex-col gap-5'>
							{posts.map((post:Post, index:number) => {
								return (
									<PostUi key={`${post.id}-${renderKey}-${index}`} postData={post} user={currentUser} googleMapsApiKey={googleMapsApiKey} />
								)
							})}
							<LoadOldPosts getOldPosts={getOldPostsFromServer} endOfPosts={endOfPosts}/>
						</div>
					}
				</APIProvider>
			}
		</>
	);
}
