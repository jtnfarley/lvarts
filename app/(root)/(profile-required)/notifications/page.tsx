import NotificationsFeed from "@/components/NotificationsFeed";
import Notification from '@/lib/models/notification';
import type { Metadata } from 'next';
import {currentUser, isLoggedIn} from "@/app/data/currentUser";
import { prisma } from "@/prisma";

// Always render fresh so a cached copy of the list never replaces new notifications.
export const dynamic = 'force-dynamic';

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
		and not exists (
			select 1 from userblocks ub
			where ub.blockeruserdetailsid = ${userdetailsid} and ub.blockeduserdetailsid = un.senderuserdetailsid
		)
		order by n.createdat desc
	`

	return notifications
}

const markNotificationsRead = async (notificationIds:number[]) => {
	'use server'

	const user = await isLoggedIn();
	const userdetailsid = user?.userdetails?.id;
	if (!userdetailsid || !notificationIds.length) return;

	// Only the session user's own notifications can be marked, whatever ids the browser sends.
	await prisma.notifications.updateMany({
		where: {
			id: { in: notificationIds },
			read: false,
			userstonotifications: { some: { receiveruserdetailsid: userdetailsid } },
		},
		data: { read: true },
	})
}

export default async function Notifications() {
	const user = await currentUser();

	if (!user || !user.userdetails) return null;

	const notis = await getNotifications(user.userdetails.id);

	return (
		<div>
			<NotificationsFeed user={user} notis={notis} markNotificationsRead={markNotificationsRead} />
		</div>
	);
}
