'use client'

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { getSidebarUserProfile } from '@/app/data/sidebar';
import { getProfileUserIdFromPath, toSidebarProfile } from "@/lib/utils"
import SignOut from '@/components/auth/buttons/SignOut';
import type SidebarProfile from '@/lib/models/sidebarProfile';
import type User from '@/lib/models/user';
import Profile from "../Cards/Profile"

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
				<div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden border border-orange">
					{profile ? 
						<Profile profile={profile} user={currentUser}/>
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
