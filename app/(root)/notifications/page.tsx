import NotificationsFeed from "@/components/NotificationsFeed";
import Notification from '@/lib/models/notification';
import type { Metadata } from 'next';
import {currentUser} from "@/app/data/currentUser";
import { prisma } from "@/prisma";

export const metadata: Metadata = {
  title: 'Notifications - Lehigh Vally Arts & Music',
  description: 'Alerts',
};

const getNotifications = async (userId:string):Promise<Array<Notification>> => {
	const notifications:Array<Notification> = await prisma.notifications.findMany({
		where: {
			userId,
		},
		include: {
			user:true,
			notiUser: true,
			notiUserDetails: true,
			post:true
		},
		orderBy: {
			createdAt: 'desc'
		},
		take: 50
	})

	return notifications
}

const updateNotis = async (notis:Notification[] | undefined) => {
	'use server'

    if (notis && notis.length) {
        notis.forEach(async noti => {
            await prisma.notifications.update({
                where: {
                    id: noti.id
                },
                data: {
                    read: true
                }
            })
        })
    }
}

export default async function Notifications() {
	const user = await currentUser();

	const notis = await getNotifications(user.id);

	return (
		<div className='rounded-box'>
			<NotificationsFeed user={user} notis={notis} updateNotis={updateNotis} />
		</div>
	);
}
