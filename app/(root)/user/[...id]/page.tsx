'use client'

import { currentUser } from '@/app/actions/currentUser';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from "next-auth/react";
import { redirect } from 'next/navigation';
import { getUserDetails } from '@/app/actions/user';
import UserDetails from '@/lib/models/userDetails';
import Follow from '@/components/shared/PostUi/Follow';
import User from '@/lib/models/user';

export default function UserProfile() {

	// const user = getUser();

	// if (!user) return redirect('/signin');

	const params = useParams<{id:string}>();
	const { data: session, status } = useSession();
	const [user, setUser] = useState<User>();
	const [singleUser, setSingleUser] = useState<UserDetails>();
	const [avatarUrl, setAvatarUrl] = useState<string | undefined>()

	const getUser = async () => {
		const user = await currentUser();
		setUser(user);
	}

	const getSingleUser = async () => {
		const singleUser = await getUserDetails(params.id.toString())
		if (!singleUser) return

		setSingleUser(singleUser);

		const avatarUrlBase = `https://lvartsmusic-ny.b-cdn.net/`
    	const avatarUrlInit = singleUser && singleUser.avatar && singleUser.userDir ? `${avatarUrlBase}/${singleUser.userDir}/${singleUser.avatar}` : undefined;
		setAvatarUrl(avatarUrlInit)
	}

	useEffect(() => {
		if (status === 'authenticated') {
			getSingleUser();
			getUser();
		}
	}, [session])

	return (
		<div className="lg:bg-white lg:rounded-xl lg:p-5 sm:bg-none sm:p-0 mt-5 min-h-100">
			{singleUser && user && 
				<section className="">
					<div className="mb-4 flex">
						<img src={avatarUrl || '/images/melty-man.png'} className='w-[50px] h-[50px] me-3'/>
						<div className='font-bold text-2xl'>{singleUser.displayName}</div>
						<Follow followUserId={singleUser.userId} user={user}/>
					</div>
					<div className="mb-4">
						{singleUser.bio}
					</div>
				</section>
			}
        </div>
	);
}
