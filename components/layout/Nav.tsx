'use client'

import { sidebarLinks } from "@/constants"
import Link from "next/link"
import { hasNewNotifications } from "@/app/actions/notifications";
import User from "@/lib/models/user";
import { BiSolidCircle } from "react-icons/bi";
import { useEffect, useState } from "react";

export default function Nav(props: {user:User}) {
	const [hasNotis, setHasNotis] = useState<boolean>(false)

	const getHasNotis = async () => {
		const hasNotis = await hasNewNotifications(props.user);
		setHasNotis(hasNotis);
	}
	
	useEffect(() => {
		getHasNotis();

		const notiInterval = setInterval(() => {
			getHasNotis();
		}, 60000)

		return () => {
			clearInterval(notiInterval)
		}
	}, [])

	return (		
		<div className='flex md:flex-col md:pe-10 gap-8 items-end'>
			{
				sidebarLinks.map((link) => {
					return (
						<Link href={link.route} key={link.label} 
						className={`leftsidebar_link flex flex-row items-center`}
						onClick={() => {
							if (link.label === 'Notifications' && hasNotis) setHasNotis(false)
						}}>
							<p className="hidden text-gray-500 text-lg md:block me-4">{link.label}</p>
							<div className="relative">
								{link.icon}
								{link.label === 'Notifications' && hasNotis &&
									<div className="absolute top-[20%] right-0"><BiSolidCircle color='red'/></div>
								}
							</div>
						</Link>
					)
				})
			}
			
		</div>
	)
}
