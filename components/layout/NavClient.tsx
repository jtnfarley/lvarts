'use client'

import { BiSolidHomeAlt2, BiSolidSearch, BiSolidUser, BiSolidBell, BiSolidCalendar } from "react-icons/bi";
import Link from "next/link"
import User from "@/lib/models/user";
import { BiSolidCircle } from "react-icons/bi";
import { BiArrowFromLeft } from "react-icons/bi";
import { useEffect, useState } from "react";

export default function NavClient(props: {user?:User, hasNotis:boolean, hasNewNotifications:Function}) {
	const {user, hasNewNotifications} = props;
	const [hasNotis, setHasNotis] = useState<boolean>(props.hasNotis);

	const checkNotis = async () => {
		const newNotis = await hasNewNotifications();
		setHasNotis(newNotis);
	}

	useEffect(() => {
		const interval = setInterval(checkNotis, 60000)

		return () => {
			clearInterval(interval);
		}
	}, [])

	return (		
		<div className='flex md:flex-col md:pe-10 gap-8 items-end'>
			{user ?
				<>
					<a href="/home" className={`leftsidebar_link flex flex-row items-center`}>
						<p className="hidden text-gray-500 text-lg md:block me-4">Home</p>
						<div className="relative">
							<BiSolidHomeAlt2 className="leftIcon"/>
						</div>
					</a>
					<Link href="/notifications" className={`leftsidebar_link flex flex-row items-center`} onClick={() => setHasNotis(false)}>
						<p className="hidden text-gray-500 text-lg md:block me-4">Notifications</p>
						<div className="relative">
							<BiSolidBell className="leftIcon"/>
							{hasNotis &&
								<div className="absolute top-[20%] right-0"><BiSolidCircle color='red'/></div>
							}
						</div>
					</Link>
					<Link href="/calendar" className={`leftsidebar_link flex flex-row items-center`}>
						<p className="hidden text-gray-500 text-lg md:block me-4">Calendar</p>
						<div className="relative">
							<BiSolidCalendar className="leftIcon"/>
						</div>
					</Link>
					<Link href="/profile" className={`leftsidebar_link flex flex-row items-center`}>
						<p className="hidden text-gray-500 text-lg md:block me-4">Profile</p>
						<div className="relative">
							<BiSolidUser className="leftIcon"/>
						</div>
					</Link>
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
