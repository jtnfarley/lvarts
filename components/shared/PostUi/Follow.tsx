'use client'

import Post from '@/lib/models/post';
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
		console.log(following)
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
				<div className='text-2xl' title={isHovered ? 'unfollow' : 'following'}
					onMouseEnter={() => setIsHovered(true)}
					onMouseLeave={() => setIsHovered(false)}
					onClick={toggleFollow}
				>
					{isHovered ? <BiSolidUserX color='red' /> : <BiSolidUserCheck color='#3126FF' />}
				</div>
			) : (
				<div className='text-2xl' title='follow'
					onMouseEnter={() => setIsHovered(true)}
					onMouseLeave={() => setIsHovered(false)}
					onClick={toggleFollow}
				>
					<BiUserPlus />
				</div>
			)}
		</div>					
    )
}