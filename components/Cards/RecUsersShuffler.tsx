'use client'

import UserCard from "./UserCard"
import UserDetails from "@/lib/models/userDetails";
import imageUrl from '@/constants/imageUrl';
import User from "@/lib/models/user";
import { useEffect, useState } from "react";

export default function RecUsersShuffler(props:{randUsers:UserDetails[], user:User}) {
	const {user, randUsers} = props;
	const [shuffledUsers, setShuffledUsers] = useState<any[]>();

	const shuffleUsers = (array:Array<any>) => {
		for (let i = array.length - 1; i > 0; i--) {
			// Pick a random index from 0 to i
			const j = Math.floor(Math.random() * (i + 1));
			// Swap elements array[i] and array[j]
			[array[i], array[j]] = [array[j], array[i]];
		}

		setShuffledUsers(array.slice(0, 5));
	}

	useEffect(() => {
		if (randUsers && randUsers.length) {
			shuffleUsers(randUsers);

			const interval = setInterval(() => {
				shuffleUsers(randUsers);
			}, 30000);

			return () => {
				clearInterval(interval);
			}
		}
	}, [])

	return (
		<div className="w-full flex justify-between xl:block ">
			{shuffledUsers && shuffledUsers.length && 
				shuffledUsers.length > 0 ? (
					<>
						{
							shuffledUsers.map((userdetails: any) => (
								<UserCard
									key={ userdetails.id }
									currentUser={ user }
									recUserId={ userdetails.id }
									displayname={ userdetails.displayname }
									handle={ userdetails.handle }
									avatar={ (userdetails && userdetails.userdir && userdetails.avatar) ?
										`${imageUrl}/${userdetails.userdir}/${userdetails.avatar}` :
										'/images/melty-man.png'
									}
									biohtml={ userdetails.biohtml }
									// userType = 'User'
								/>
							))
						}
					
					</>
				) : (
					<p className="!text-base-regular text-light-3">No users yet</p>
				)
			}
		</div>			
	)
}
