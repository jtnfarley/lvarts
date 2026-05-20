'use client'

import { useEffect, useRef, useState } from 'react';
import {APIProvider} from '@vis.gl/react-google-maps';
import UserDetails from '@/lib/models/userDetails';
import User from '@/lib/models/user';
import PostUi from '@/components/PostUi/PostUi';
import Post from '@/lib/models/post';
import { getSidebarUserProfile } from '@/app/data/sidebar';
import { getProfileUserIdFromPath, toSidebarProfile } from "@/lib/utils"
import Profile from "./Cards/Profile"
import { LoadOldPosts } from './PostUi/LoadOldPosts';
import { usePathname } from 'next/navigation';
import SidebarProfile from '@/lib/models/sidebarProfile';
import { FeedRow } from '@/lib/models/initFeedRow';

export default function UserProfile(props:{currentUser:User, userProfile:UserDetails, posts:FeedRow[], getOldPosts:Function, googleMapsApiKey:string}) {
	const {currentUser, getOldPosts, googleMapsApiKey, userProfile} = props;
	const pathname = usePathname();
	const loggedInProfile = toSidebarProfile(userProfile);
	const viewedUserId = getProfileUserIdFromPath(pathname);
	const targetUserId = viewedUserId || userProfile.handle || null;
	const [profile, setProfile] = useState(loggedInProfile);

	const [posts, setPosts] = useState<FeedRow[]>(props.posts || []);
	const [renderKey, setRenderKey] = useState(0);
	const tempFeedRef = useRef<FeedRow[]>(props.posts || []);
	const [endOfPosts, setEndOfPosts] = useState(false);

	const getOldPostsFromServer = async () => {
		const oldPosts = await getOldPosts(profile?.userid, posts.length);
	
		if (oldPosts && oldPosts.length && tempFeedRef.current && tempFeedRef.current.length) {
			tempFeedRef.current = [...tempFeedRef.current, ...oldPosts];
			setPosts(tempFeedRef.current)
			setRenderKey(prev => prev + 1)
		} else {
			setEndOfPosts(true);
		}
	}

	useEffect(() => {
		let cancelled = false;

		if (targetUserId === userProfile.handle && loggedInProfile) {
			setProfile(loggedInProfile);
		} else {
			setProfile(null);
		}

		const loadProfile = async () => {
			if (!targetUserId) {
				setProfile(loggedInProfile);
				return;
			}

			try {
				const nextProfile = await getSidebarUserProfile(targetUserId);

				if (!cancelled) {
					setProfile(nextProfile || loggedInProfile);
				}
			} catch(err) {
				console.log(err)
				if (!cancelled) {
					setProfile(loggedInProfile);
				}
			}
		}

		loadProfile();

		return () => {
			cancelled = true;
		}
	}, [currentUser.id, targetUserId])

	return (
		<>
            {googleMapsApiKey &&
                <APIProvider apiKey={googleMapsApiKey || ''}>
					<div className="xl:hidden lg:block lg:bg-white lg:rounded-xl lg:p-5 sm:bg-none sm:p-0 mt-5 mb-5 border border-orange">
						{profile && 
							<Profile profile={profile} user={currentUser}/>
						}
					</div>

					{userProfile && posts &&
						<div className='flex flex-col gap-5'>
							{posts.map((post:FeedRow, index:number) => {
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
