import Link from "next/link"
import User from "@/lib/models/user";
import { prisma } from "@/prisma";
import { BiSolidArrowToRight } from "react-icons/bi";
import NavClient from "./NavClient";

const hasNewNotifications = async (userdetailsid:number):Promise<boolean> => {
	'use server'

	const notifications = await prisma.$queryRaw<Array<{ count: string }>>`
		select count(n.id) from notifications n
		join userstonotifications un on n.id = un.notificationid
		where read = false and receiveruserdetailsid = ${userdetailsid}
	`
	return (notifications && notifications.length && Number.parseInt(notifications[0].count) > 0) ? true : false
}

export default async function Nav(props: {user?:User}) {
	const {user} = props;
	let hasNotis = false;

	if (user && user.userdetails) {
		hasNotis = await hasNewNotifications(user.userdetails.id);
	}

	return (		
		<div className=''>
			{user ?
				<NavClient user={user} hasNotis={hasNotis} hasNewNotifications={hasNewNotifications}/>
				:
				<Link href='/' className='leftsidebar_link flex flex-row items-center'>
					<p className="hidden text-gray-500 text-lg md:block me-4">Sign In</p>
					<div className="relative">
						<BiSolidArrowToRight className='leftIcon'/>
					</div>
				</Link>
			}
			
		</div>
	)
}
