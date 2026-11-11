import { prisma } from '@/prisma';
import { getCalendarAccount, REJECTED_POST_TYPE } from './db';

export type CalendarEvent = {
	postId: number;
	eventName: string;
	eventDate: Date;
	venueName: string | null;
	isPrivate: boolean;
};

// Upcoming events by the calendar account that have not been rejected, soonest first.
export const getUpcomingCalendarEvents = async (): Promise<CalendarEvent[]> => {
	const account = await getCalendarAccount();
	const posts = await prisma.posts.findMany({
		where: {
			usertoposts: { some: { userdetailsid: account.id } },
			posttypes: { posttype: { not: REJECTED_POST_TYPE } },
			events: { eventdate: { gte: new Date() } },
		},
		include: { events: { include: { venues: true } } },
		orderBy: { events: { eventdate: 'asc' } },
	});

	const events: CalendarEvent[] = [];
	for (const post of posts) {
		if (!post.events?.eventdate) continue;
		events.push({
			postId: post.id,
			eventName: post.events.eventname ?? '(untitled)',
			eventDate: post.events.eventdate,
			venueName: post.events.venues?.venuename ?? null,
			isPrivate: post.privatepost ?? false,
		});
	}
	return events;
};
