'use client'

import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import { useSession } from "next-auth/react";
import { currentUser } from '@/app/actions/currentUser';
import PostUi from '@/components/PostUi/PostUi';
import Post from '@/lib/models/post';
import AccountInfo from '@/components/forms/AccountInfo';
import User from '@/lib/models/user';
import { getUserPosts } from '@/app/actions/posts';

export default function Profile() {
	const { data: session, status } = useSession();
	const [user, setUser] = useState<User>();
	const [posts, setPosts] = useState<Post[] | undefined>();
	const [renderKey, setRenderKey] = useState(0);

	const getUser = async () => {
		const user = await currentUser();

		if (!user) redirect('/');

		setUser(user);

		getPosts(user);
	}

	const getPosts = async (user:User) => {
		const userPosts = await getUserPosts(user.id)

		if (userPosts) {
			setPosts(userPosts);
		}

		setRenderKey(prev => prev + 1)
	}

	useEffect(() => {
		if (status === 'authenticated') {
			getUser();
		}
	}, [session])

	return (
		<div className='flex flex-col gap-5'>
			<div className="rounded-box mt-5 lg:bg-white lg:rounded-3xl lg:p-5 sm:bg-none sm:p-0">
				<div className="flex flex-col items-center justify-center">
					<h1 className="text-2xl font-bold">Profile</h1>
				</div>
				{user &&
					<AccountInfo user={user}/>
				}
			</div>

			{user && posts &&
				<div className='flex flex-col gap-5'>
					{posts.map((post:Post, index:number) => {
						return (
							<PostUi key={`${post.id}-${renderKey}-${index}`} postData={post} user={user} googleMapsApiKey={''} />
						)
					})}
				</div>
			}
		</div>
	);
}
