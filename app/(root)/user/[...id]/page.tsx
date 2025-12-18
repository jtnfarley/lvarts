'use client'

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from "next-auth/react";
import { getUserDetails } from '@/app/actions/user';
import UserDetails from '@/lib/models/userDetails';

export default function UserProfile() {

	const params = useParams<{id:string}>();
	const { data: session, status } = useSession();
	const [user, setUser] = useState<UserDetails>();
	const [avatarUrl, setAvatarUrl] = useState<string | undefined>()

	const getUser = async () => {
		console.log(params.id.toString())
		const singleUser = await getUserDetails(params.id.toString())
		if (!singleUser) return

		setUser(singleUser);

		const avatarUrlBase = `https://lvartsmusic-ny.b-cdn.net/`
    	const avatarUrlInit = singleUser && singleUser.avatar && singleUser.userDir ? `${avatarUrlBase}/${singleUser.userDir}/${singleUser.avatar}` : undefined;
		setAvatarUrl(avatarUrlInit)
	}

	useEffect(() => {
		if (status === 'authenticated') {
			getUser()
		}
	}, [session])

	return (
		<div className="lg:bg-white lg:rounded-xl lg:p-5 sm:bg-none sm:p-0 mt-5 min-h-100">
			{user && 
				<section className="">
					<div className="mb-4 flex">
						<img src={avatarUrl || '/images/melty-man.png'} className='w-[50px] h-[50px] me-3'/>
						<div className='font-bold text-2xl'>{user.displayName}</div>
					</div>
					<div className="mb-4">
						{user.bio}
					</div>
				</section>
			}
        </div>
	);
}
