'use client'

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { getSidebarUserProfile } from '@/app/data/sidebar';
import { cn, getProfileUserIdFromPath, toSidebarProfile } from "@/lib/utils"
import type SidebarProfile from '@/lib/models/sidebarProfile';
import type User from '@/lib/models/user';
import Profile from "../Cards/Profile"

export default function LeftSidebar(props:{currentUser:User, theme?:'lvartsmusic'}) {
	const { currentUser, theme } = props;
	const userdetails = currentUser.userdetails;
	const isLvartsmusic = theme === 'lvartsmusic';

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
			console.log(nextProfile)
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

	const emptyStateClass = isLvartsmusic
		? "flex min-h-0 flex-1 flex-col justify-center rounded-2xl border border-lvartsmusic-border bg-lvartsmusic-card px-5 py-8 text-center text-lvartsmusic-muted"
		: "flex min-h-0 flex-1 flex-col justify-center rounded-tr-md bg-gray-900/40 px-5 py-8 text-center text-gray-300";
	const ctaClass = isLvartsmusic
		? "mt-6 rounded-full bg-lvartsmusic-accent px-4 py-2 text-sm font-semibold text-lvartsmusic-accent-foreground"
		: "mt-6 rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-900";

	return (
		<section className={isLvartsmusic
			? "sticky top-16 hidden h-[calc(100vh-4rem)] w-[300px] shrink-0 flex-col justify-between overflow-y-auto py-4 pr-6 lg:flex"
			: "leftsidebar bg-[#0c0a18]/50 backdrop-blur-sm"
		}>
			{!isLvartsmusic &&
				<Link href='/home' className="flex justify-center items-center">
					<Image
						src='/logos/lvarts-artsy-paths.svg'
						alt="Lehigh Valley Arts & Music"
						width={384}
						height={384}
						priority
						style={{opacity:'85%'}}
					/>
				</Link>
			}
			<div className="flex min-h-0 w-full flex-1 flex-col">
				<div className="flex min-h-0 flex-1 flex-col overflow-hidden">
					{isAnonymous &&
						<div className={emptyStateClass}>
							<div className="text-xl font-bold uppercase">{profileLabel}</div>
							<div className="mt-3 text-sm text-gray-400">
								Come play with us, Danny.
							</div>
							<Link href="/" className={ctaClass}>
								Sign Up
							</Link>
						</div>
					}
					{!hasUserDetails && !isAnonymous &&
						<div className={emptyStateClass}>
							<div className="text-xl font-bold uppercase">{profileLabel}</div>
							<div className="mt-3 text-sm text-gray-400">
								Complete your profile to unlock the feed and the rest of the app.
							</div>
							<Link href="/profile" className={ctaClass}>
								Finish Profile
							</Link>
						</div>
					}
					{hasUserDetails && profile ?
						<Profile profile={profile} user={currentUser} getUpdatedProfile={getSidebarUserProfile} theme={theme}/>
						: hasUserDetails ?
						<div className="flex flex-1 items-center justify-center uppercase text-sm text-gray-400">Loading profile</div>
						: null
					}
				</div>
			</div>
		</section>
	)
}
