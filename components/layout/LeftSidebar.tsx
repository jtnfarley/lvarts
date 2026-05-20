'use client'

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { getSidebarUserProfile } from '@/app/data/sidebar';
import { getProfileUserIdFromPath, toSidebarProfile } from "@/lib/utils"
import type SidebarProfile from '@/lib/models/sidebarProfile';
import type User from '@/lib/models/user';
import Profile from "../Cards/Profile"

export default function LeftSidebar(props:{currentUser:User}) {
	const { currentUser } = props;
	const userdetails = currentUser.userdetails;

	const isAnonymous = currentUser.anonymous;

	const pathname = usePathname();
	const loggedInProfile = toSidebarProfile(userdetails);
	const [hasUserDetails, setHasUserDetails] = useState<boolean>(Boolean(userdetails && loggedInProfile));
	const profileLabel = currentUser.name || currentUser.email || (isAnonymous) ? 'Join us!' : 'Your account';
	const targetUserId = hasUserDetails
		? getProfileUserIdFromPath(pathname) || userdetails?.handle || null
		: null;

	let cancelled = false;

	const [profile, setProfile] = useState<SidebarProfile | null>(() => {
		if (hasUserDetails && targetUserId === userdetails?.handle) {
			return loggedInProfile
		}

		return null
	})

	const loadProfile = async (handle:string, cancelled:boolean) => {
		try {
			const nextProfile = await getSidebarUserProfile(handle);
			if (!cancelled) {
				setProfile(nextProfile || loggedInProfile)
			}
		} catch {
			if (!cancelled) {
				setProfile(loggedInProfile)
			}
		}
	}

	useEffect(() => {
		if (!hasUserDetails || !targetUserId || !userdetails) {
			setProfile(null);
			return;
		}

		if (targetUserId === userdetails?.handle && loggedInProfile) {
			setProfile(loggedInProfile);
		} else {
			setProfile(null);
		}

		loadProfile(targetUserId, cancelled);

		return () => {
			cancelled = true
		}
	}, [currentUser.id, hasUserDetails, targetUserId])

	const handleProfileUpdated = async (ev:Event) => {
		const cev = ev as CustomEvent;

		if (targetUserId) {
        	loadProfile(targetUserId, cancelled);
		} else if (cev.detail && cev.detail.handle) {
			setHasUserDetails(true);
			loadProfile(cev.detail.handle, cancelled);
		}
    }

	useEffect(() => {
        window.addEventListener('profileUpdated', handleProfileUpdated);

        return () => {
            window.removeEventListener('profileUpdated', handleProfileUpdated);
        };
    }, [])

	return (
		<section className="leftsidebar pt-3">
			<Link href='/home' className="flex justify-center items-center">
				<Image
					src='/logos/art-abbr-paths.svg'
					alt="Lehigh Valley Arts & Music"
					width={125}
					height={125}
					priority 
					className="rotate-345"
				/>
			</Link>
			<div className="flex min-h-0 w-full flex-1 flex-col">
				<div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden">
					{isAnonymous &&
						<div className="flex min-h-0 flex-1 flex-col justify-center rounded-tr-md bg-gray-700/30 px-5 py-8 text-center text-gray-300">
							<div className="text-xl font-bold uppercase">{profileLabel}</div>
							<div className="mt-3 text-sm text-gray-400">
								Come play with us, Danny.
							</div>
							<Link
								href="/"
								className="mt-6 rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-900"
							>
								Sign Up
							</Link>
						</div>
					}
					{!hasUserDetails && !isAnonymous &&
						<div className="flex min-h-0 flex-1 flex-col justify-center rounded-tr-md bg-gray-700/30 px-5 py-8 text-center text-gray-300">
							<div className="text-xl font-bold uppercase">{profileLabel}</div>
							<div className="mt-3 text-sm text-gray-400">
								Complete your profile to unlock the feed and the rest of the app.
							</div>
							<Link
								href="/profile"
								className="mt-6 rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-900"
							>
								Finish Profile
							</Link>
						</div>
					}
					{hasUserDetails && profile ? 
						<Profile profile={profile} user={currentUser} getUpdatedProfile={getSidebarUserProfile}/>
						: hasUserDetails ?
						<div className="flex flex-1 items-center justify-center uppercase text-sm text-gray-400">Loading profile</div>
						: null
					}
				</div>
			</div>
		</section>
	)
}
