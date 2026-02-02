import Link from "next/link"
import User from "@/lib/models/user";
import { prisma } from "@/prisma";
import Notification from "@/lib/models/notification";
import { BiSolidArrowToRight } from "react-icons/bi";
import NavClient from "./NavClient";

const hasNewNotifications = async (userId:string):Promise<boolean> => {
	'use server'
console.log(userId)
	const notifications:Array<Notification> = await prisma.notifications.findMany({
		where: {
			AND: [
				{userId: userId},
				{read: false}
			]
		}
	})
console.log(notifications)
	return (notifications.length) ? true : false
}

export default async function Nav(props: {user?:User}) {
	const {user} = props;
	let hasNotis = false;

	if (user) {
		hasNotis = await hasNewNotifications(user.id);
	}

	return (		
		<div className='flex md:flex-col md:pe-10 gap-8 items-end'>
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
