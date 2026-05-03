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

export default function UserProfile(props:{currentUser:User, userDetails:UserDetails, getOldPosts:Function, googleMapsApiKey:string}) {
	const {currentUser, getOldPosts, googleMapsApiKey, userDetails} = props;
	const pathname = usePathname();
	const loggedInProfile = toSidebarProfile(currentUser);
	const viewedUserId = getProfileUserIdFromPath(pathname);
	const targetUserId = viewedUserId || currentUser.id;

	const [profile, setProfile] = useState<SidebarProfile | null>(() => {
		if (targetUserId === currentUser.id) {
			return loggedInProfile;
		}

		return null;
	})

	const [posts, setPosts] = useState<Post[]>(userDetails.posts || []);
	const [renderKey, setRenderKey] = useState(0);
	const tempFeedRef = useRef<Post[]>(userDetails.posts);
	const [endOfPosts, setEndOfPosts] = useState(false);

	const getOldPostsFromServer = async () => {
		const oldPosts = await getOldPosts(profile?.userId, posts.length);
	
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

		if (targetUserId === currentUser.id && loggedInProfile) {
			setProfile(loggedInProfile);

			return () => {
				cancelled = true;
			}
		}

		setProfile(null);

		const loadProfile = async () => {
			try {
				const nextProfile = await getSidebarUserProfile(targetUserId);

				if (!cancelled) {
					setProfile(nextProfile || loggedInProfile);
				}
			} catch {
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

					{userDetails && posts &&
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
