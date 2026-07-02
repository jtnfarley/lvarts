'use client'

import User from '@/lib/models/user';

import { BiUserPlus } from "react-icons/bi";

import { useEffect, useState } from 'react';
import { followUser, unfollowUser } from '@/app/actions/user';
import { useFollowsStore } from '@/stores/follows-store';

export default function Follow(props:{followinguserdetailsid:number, user:User}) {
	const followinguserdetailsid = props.followinguserdetailsid;
	const user = props.user;
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
		<div className='flex shrink-0 justify-end'>
			{isFollowing ? (
				<button
					type="button"
					className="group rounded-full border border-zinc-500/50 px-3.5 py-1.5 text-sm font-semibold text-lvartsmusic-foreground transition-colors hover:border-rose-800 hover:bg-rose-950/20 hover:text-rose-500"
					disabled={isSubmitting}
					onClick={toggleFollow}
				>
					<span className="group-hover:hidden">Following</span>
					<span className="hidden group-hover:inline">Unfollow</span>
				</button>
			) : (
				<button
					type="button"
					className="lvartsmusic-pill-accent flex items-center gap-1.5 px-3.5 py-1.5"
					disabled={isSubmitting}
					onClick={toggleFollow}
				>
					<BiUserPlus /> Follow
				</button>
			)}
		</div>
    )
}
