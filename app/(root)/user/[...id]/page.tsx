'use client'

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from "next-auth/react";
import { currentUser } from '@/app/actions/currentUser';
import {APIProvider} from '@vis.gl/react-google-maps';
import { getEnv } from '@/app/actions/getEnv';
import { getUserDetails } from '@/app/actions/user';
import UserDetails from '@/lib/models/userDetails';
import Follow from '@/components/PostUi/Follow';
import User from '@/lib/models/user';
import imageUrl from '@/constants/imageUrl';
import PostUi from '@/components/PostUi/PostUi';
import Post from '@/lib/models/post';

export default function UserProfile() {
	const params = useParams<{id:string}>();
	const { data: session, status } = useSession();
	const [user, setUser] = useState<User>();
	const [singleUser, setSingleUser] = useState<UserDetails>();
	const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
	const [posts, setPosts] = useState<Post[] | undefined>();
	const [renderKey, setRenderKey] = useState(0);
	const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string | undefined>()

	const getUser = async () => {
		const user = await currentUser();
		setUser(user);
	}

	const getSingleUser = async () => {
		const gmk = await getEnv('GOOGLE_MAPS');
        setGoogleMapsApiKey(gmk);

		const singleUser = await getUserDetails(params.id.toString())
		if (!singleUser) return

		setSingleUser(singleUser);

		if (singleUser.posts) {
			setPosts(singleUser.posts);
		}
		const avatarUrlBase = imageUrl;
    	const avatarUrlInit = singleUser && singleUser.avatar && singleUser.userDir ? `${avatarUrlBase}/${singleUser.userDir}/${singleUser.avatar}` : undefined;
		setAvatarUrl(avatarUrlInit)

		setRenderKey(prev => prev + 1)
	}

	useEffect(() => {
		if (status === 'authenticated') {
			getSingleUser();
			getUser();
		}
	}, [session])

	return (
		<>
            {googleMapsApiKey &&
                <APIProvider apiKey={googleMapsApiKey || ''}>
					<div className='pb-5'>
						<div className="lg:bg-white lg:rounded-xl lg:p-5 sm:bg-none sm:p-0 mt-5 mb-5">
							{singleUser && user && 
								<section className="flex flex-col justify-between min-h-50">
									<div className="mb-4 flex">
										<img src={avatarUrl || '/images/melty-man.png'} className='w-[50px] h-[50px] me-3'/>
										<div className='font-bold text-2xl'>{singleUser.displayName}</div>
										<Follow followUserId={singleUser.userId} user={user}/>
									</div>
									<div className="mb-4">
										{singleUser.bio}
									</div>
									<div className='flex justify-between text-sm uppercase'>
										<div>Followers: <strong>{singleUser.followers.length || 0}</strong></div>
										<div>Following: <strong>{singleUser.following.length || 0}</strong></div>
									</div>
								</section>
							}
						</div>

						{singleUser && user && posts &&
							<div className='flex flex-col gap-5'>
								{posts.map((post:Post, index:number) => {
									return (
										<PostUi key={`${post.id}-${renderKey}-${index}`} postData={post} user={user} googleMapsApiKey={googleMapsApiKey} />
									)
								})}
							</div>
						}
					</div>
				</APIProvider>
			}
		</>
	);
}
