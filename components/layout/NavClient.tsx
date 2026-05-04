'use client'

import { BiSolidHomeAlt2, BiSolidSearch, BiSolidUser, BiSolidBell, BiSolidCalendar,  BiArrowFromLeft, BiSolidCircle } from "react-icons/bi";
import Link from "next/link"
import User from "@/lib/models/user";
import { useEffect, useState } from "react";
import SignOut from '@/components/auth/buttons/SignOut';

export default function NavClient(props: {user?:User, hasNotis:boolean, hasNewNotifications:Function}) {
	const {user, hasNewNotifications} = props;
	const [hasNotis, setHasNotis] = useState<boolean>(props.hasNotis);

	const checkNotis = async () => {
		const newNotis = await hasNewNotifications(user?.id);
		setHasNotis(newNotis);
	}

	useEffect(() => {
		const interval = setInterval(checkNotis, 60000)

		return () => {
			clearInterval(interval);
		}
	}, [])

	return (		
		<div className='flex gap-8 justify-center items-center mb-6'>
			{user ?
				<>
					<a href="/home" className={`leftsidebar_link flex flex-row items-center`} title="Home">
						<div className="relative">
							<BiSolidHomeAlt2 className="leftIcon"/>
						</div>
					</a>
					<Link href="/notifications" className={`leftsidebar_link flex flex-row items-center`} title="Notifications" onClick={() => setHasNotis(false)}>
						<div className="relative">
							<BiSolidBell className="leftIcon"/>
							{hasNotis &&
								<div className="absolute top-[20%] right-0"><BiSolidCircle color='red'/></div>
							}
						</div>
					</Link>
					<Link href="/calendar" className={`leftsidebar_link flex flex-row items-center`} title="Calendar">
						<div className="relative">
							<BiSolidCalendar className="leftIcon"/>
						</div>
					</Link>
					{/* <Link href="/scene" className={`leftsidebar_link flex flex-row items-center`}>
						<div className="relative">
							<BiSolidSearch className="leftIcon"/>
						</div>
					</Link> */}
					<Link href="/profile" className={`leftsidebar_link flex flex-row items-center`} title="Edit Profile">
						<div className="relative">
							<BiSolidUser className="leftIcon"/>
						</div>
					</Link>
					{user &&
						<>
							<div>
								<SignOut/>
							</div>
						</>
					}
				</>
				:
				<Link href='/' className='leftsidebar_link flex flex-row items-center'>
					<p className="hidden text-gray-500 text-lg md:block me-4">Sign In</p>
					<div className="relative">
						<BiArrowFromLeft />
					</div>
				</Link>
			}
			
		</div>
	)
}
