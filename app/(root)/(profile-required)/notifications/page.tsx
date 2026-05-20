import NotificationsFeed from "@/components/NotificationsFeed";
import Notification from '@/lib/models/notification';
import type { Metadata } from 'next';
import {currentUser} from "@/app/data/currentUser";
import { prisma } from "@/prisma";

export const metadata: Metadata = {
  title: 'Notifications - Lehigh Vally Arts & Music',
  description: 'Alerts',
};

const getNotifications = async (userdetailsid:number):Promise<Notification[]> => {
	const notifications = await prisma.$queryRaw<Notification[]>`
		select n.id as notiid, notificationtype, ud.id as senderuserdetailsid, postid, read, displayname, userdir, avatar, handle, biohtml from notifications n
		join userstonotifications un on n.id = un.notificationid
		join userdetails ud on ud.id = un.senderuserdetailsid
		join notificationtypes nt on nt.id = n.notificationtypeid
		where receiveruserdetailsid = ${userdetailsid}
		order by n.createdat desc
	`

	return notifications
}

const updateNotis = async (notis:Notification[] | undefined) => {
	'use server'

    if (notis && notis.length) {
        notis.forEach(async noti => {
            await prisma.notifications.update({
                where: {
                    id: noti.notiid
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

	if (!user || !user.userdetails) return null;

	const notis = await getNotifications(user.userdetails.id);

	return (
		<div className='rounded-box'>
			<NotificationsFeed user={user} notis={notis} updateNotis={updateNotis} />
		</div>
	);
}
