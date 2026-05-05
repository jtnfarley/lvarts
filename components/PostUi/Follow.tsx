'use client'

import User from '@/lib/models/user';

import { BiSolidUserCheck, BiUserPlus, BiSolidUserX } from "react-icons/bi";

import { useEffect, useState } from 'react';
import { followUser, unfollowUser } from '@/app/actions/user';

export default function Follow(props:{followUserId:string, user:User}) {
	const followUserId = props.followUserId;
	const user = props.user;
	const [isHovered, setIsHovered] = useState(false);
	const [following, setFollowing] = useState(false);

	const toggleFollow = async () => {
		if (following) {
			await unfollowUser({userId:user.id, toFollowId:followUserId})
			setFollowing(false)
			return
		}   

		await followUser({userId:user.id, toFollowId:followUserId})
		setFollowing(true)
	}

	useEffect(() => {
		if (user.userDetails?.following.includes(followUserId)) {
			setFollowing(true)
		}
	}, [])

    return (
		<div className='flex flex-grow justify-end me-2 align-middle'>
			{following ? (
				<button className='text-2xl bg-amber-50 text-gray-300 p-1 rounded-sm max-h-[34px] cursor-pointer border-1' title={isHovered ? 'unfollow' : 'following'}
					onMouseEnter={() => setIsHovered(true)}
					onMouseLeave={() => setIsHovered(false)}
					onClick={toggleFollow}
				>
					{isHovered ? <BiSolidUserX color='#f03030' /> : <BiSolidUserCheck color='#12bc01' />}
				</button>
			) : (
				<button className='text-2xl bg-purple-700 text-gray-300 p-1 rounded-sm max-h-[36px] cursor-pointer' title='follow'
					onMouseEnter={() => setIsHovered(true)}
					onMouseLeave={() => setIsHovered(false)}
					onClick={toggleFollow}
				>
					<BiUserPlus />
				</button>
			)}
		</div>					
    )
}