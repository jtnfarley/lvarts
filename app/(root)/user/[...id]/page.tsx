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

	const getUser = async () => {
		console.log(params.id.toString())
		const singleUser = await getUserDetails(params.id.toString())
		if (!singleUser) return

		setUser(singleUser);
	}

	useEffect(() => {
		if (status === 'authenticated') {
			getUser()
		}
	}, [session])

	return (
		<div>
			{user && 
				<section className="">
					<div className="mb-4">
						<label className="block text-gray-700 font-medium mb-2" htmlFor="name">
							Avatar
						</label>
						{/* {user.avatar} */}
					</div>
					<div className="mb-4">
						<label className="block text-gray-700 font-medium mb-2" htmlFor="name">
							Display Name
						</label>
						{user.displayName}
					</div>
					<div className="mb-4">
						<label className="block text-gray-700 font-medium mb-2" htmlFor="name">
							Bio
						</label>
						{user.bio}
					</div>
				</section>
			}
        </div>
	);
}
