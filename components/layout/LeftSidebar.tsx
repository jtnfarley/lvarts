'use client'

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { getSidebarUserProfile } from '@/app/data/sidebar';
import SignOut from '@/components/auth/buttons/SignOut';
import imageUrl from '@/constants/imageUrl';
import type SidebarProfile from '@/lib/models/sidebarProfile';
import type User from '@/lib/models/user';

const getProfileUserIdFromPath = (pathname:string) => {
	const match = pathname.match(/^\/user\/([^/]+)$/)

	return match ? match[1] : null
}

const toSidebarProfile = (user:User): SidebarProfile | null => {
	if (!user.userDetails) {
		return null
	}

	return {
		userId: user.userDetails.userId,
		displayName: user.userDetails.displayName,
		avatar: user.userDetails.avatar,
		userDir: user.userDetails.userDir,
		followers: user.userDetails.followers,
		following: user.userDetails.following,
		bio: user.userDetails.bio,
		postCount: user.userDetails.postCount || 0,
		urls: user.userDetails.urls || []
	}
}

export default function LeftSidebar(props:{currentUser:User}) {
	const { currentUser } = props
	const pathname = usePathname()
	const loggedInProfile = toSidebarProfile(currentUser)
	const viewedUserId = getProfileUserIdFromPath(pathname)
	const targetUserId = viewedUserId || currentUser.id
	const [profile, setProfile] = useState<SidebarProfile | null>(() => {
		if (targetUserId === currentUser.id) {
			return loggedInProfile
		}

		return null
	})

	useEffect(() => {
		let cancelled = false

		if (targetUserId === currentUser.id && loggedInProfile) {
			setProfile(loggedInProfile)

			return () => {
				cancelled = true
			}
		}

		setProfile(null)

		const loadProfile = async () => {
			try {
				const nextProfile = await getSidebarUserProfile(targetUserId)

				if (!cancelled) {
					setProfile(nextProfile || loggedInProfile)
				}
			} catch {
				if (!cancelled) {
					setProfile(loggedInProfile)
				}
			}
		}

		loadProfile()

		return () => {
			cancelled = true
		}
	}, [currentUser.id, targetUserId])

	const avatarSrc = (profile && profile.userDir && profile.avatar) ?
		`${imageUrl}/${profile.userDir}/${profile.avatar}` :
		'/images/melty-man.png'

	return (
		<section className="leftsidebar p-4">
			<div className="flex min-h-0 w-full flex-1 flex-col">
				<Link href='/home' className="flex items-center">
                    <Image
                        src='/logos/lvarts-paths.svg'
                        alt="Lehigh Valley Arts & Music"
                        width={500}
                        height={195}
                        className='w-full'
						priority
                    />
                </Link>
				<div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden border border-orange p-10">
					{profile ? 
						<div className="flex min-h-0 flex-1 flex-col">
							<div className='h-45 flex justify-center'>
								<Image
									src={avatarSrc}
									alt={profile?.displayName || 'Lehigh Valley Art & Music'}
									width={300}
									height={300}
									className='avatar-profile'
								/>
							</div>
							<div className="flex justify-center uppercase text-xl font-bold mb-6">{profile.displayName}</div>
							<div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto pe-2">	
								<div className="w-full flex flex-col items-center justify-center mb-5">
									<div className="text-2xl"><strong>{profile.postCount || 0}</strong></div>
									<div className="uppercase text-sm">posts</div>
								</div>
								<div className="flex mb-10">
									<div className="w-1/2 flex flex-col items-center justify-center border-e-2">
										<div className="text-2xl"><strong>{profile.followers.length || 0}</strong></div>
										<div className="uppercase text-sm">followers</div>
									</div>
									<div className="w-1/2 flex flex-col items-center justify-center">
										<div className="text-2xl"><strong>{profile.following.length || 0}</strong></div>
										<div className="uppercase text-sm">following</div>
									</div>
								</div>
								<div className="mb-10">{profile.bio}</div>
								{profile.urls && profile.urls.length > 0 &&
									<div className="mb-4">
										<div className="text-lg font-bold flex justify-center">Links</div>
										{profile.urls.map((url, index) => {
											return (
												<div key={index} className='mb-2'>
													<a href={url} target='blank' className='text-blue-500'>{url}</a>
												</div>
											)
										})}
									</div>
								}
							</div>
						</div>
						:
						<div className="flex flex-1 items-center justify-center uppercase text-sm text-gray-400">Loading profile</div>
					}
					<div className='mt-6 flex flex-col items-center'>
						{currentUser &&
							<div>
								<SignOut/>
								<div className='mt-3 text-md text-gray-400'><Link href='/code-of-conduct' className='code-link'>Code of Conduct</Link></div>
							</div>
						}
					</div>
				</div>
			</div>
		</section>
	)
}
