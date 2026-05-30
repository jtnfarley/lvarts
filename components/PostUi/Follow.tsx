'use client'

import User from '@/lib/models/user';

import { BiSolidUserCheck, BiUserPlus, BiSolidUserX } from "react-icons/bi";

import { useEffect, useState } from 'react';
import { followUser, unfollowUser } from '@/app/actions/user';
import { useFollowsStore } from '@/stores/follows-store';

export default function Follow(props:{followinguserdetailsid:number, user:User}) {
	const followinguserdetailsid = props.followinguserdetailsid;
	const user = props.user;
	const [isHovered, setIsHovered] = useState(false);
	const [isFollowing, setIsFollowing] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const following = useFollowsStore((state) => state.following);
    const addFollowing = useFollowsStore((state) => state.addFollowing);
    const removeFollowing = useFollowsStore((state) => state.removeFollowing);

	const toggleFollow = async () => {
		if (
			!user ||
			!user.userdetails ||
			!followinguserdetailsid ||
			isSubmitting ||
			user.userdetails.id === followinguserdetailsid
		) return;

		setIsSubmitting(true);

		try {
			if (isFollowing) {
				const success = await unfollowUser({userdetailsid:user.userdetails.id, followinguserdetailsid});

				if (!success) return;

				removeFollowing(followinguserdetailsid);
				setIsFollowing(false);
				return;
			}

			const success = await followUser({userdetailsid:user.userdetails.id, followinguserdetailsid});

			if (!success) return;

			addFollowing(followinguserdetailsid);
			setIsFollowing(true);
		} catch (error) {
			console.error('Failed to toggle follow state', error);
		} finally {
			setIsSubmitting(false);
		}
	}

	useEffect(() => {
		if (following.includes(followinguserdetailsid)) {
			setIsFollowing(true)
		}
	}, [following])

    return (
		<div className='flex flex-grow justify-end me-2 align-middle'>
			{isFollowing ? (
				<button className='text-2xl bg-amber-50 text-gray-300 p-1 rounded-sm max-h-[34px] cursor-pointer border-1' title={isHovered ? 'unfollow' : 'following'}
					disabled={isSubmitting}
					onMouseEnter={() => setIsHovered(true)}
					onMouseLeave={() => setIsHovered(false)}
					onClick={toggleFollow}
				>
					{isHovered ? <BiSolidUserX color='#f03030' /> : <BiSolidUserCheck color='#12bc01' />}
				</button>
			) : (
				<button className='text-2xl bg-purple-700 text-gray-300 p-1 rounded-sm max-h-[36px] cursor-pointer' title='follow'
					disabled={isSubmitting}
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
