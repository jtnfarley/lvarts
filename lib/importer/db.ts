import { prisma } from '@/prisma';
import { saveTrustedPost } from '@/lib/posts/savePost';
import { extractSourceUrl } from './postContent';
import type { ExistingEvent, ImportStore } from './sync';

export const CALENDAR_EMAIL = 'calendar@lvartandmusic.com';
export const REJECTED_POST_TYPE = 'event_import_rejected';

export type CalendarAccount = { id: number; userdir: string };

export const getCalendarAccount = async (): Promise<CalendarAccount> => {
	const user = await prisma.user.findUnique({
		where: { email: CALENDAR_EMAIL },
		select: { userdetails: { select: { id: true, userdir: true } } },
	});
	const details = user?.userdetails;
	if (!details?.userdir) throw new Error('Calendar account not found. Run scripts/seed-calendar.ts first.');
	return { id: details.id, userdir: details.userdir };
};

export const findVenueId = async (venueName: string): Promise<number> => {
	const venue = await prisma.venues.findFirst({ where: { venuename: venueName }, select: { id: true } });
	if (!venue) throw new Error(`Venue "${venueName}" not found. Run scripts/seed-calendar.ts first.`);
	return venue.id;
};

// Every event post by the calendar account, including rejected ones (they still count for dedupe).
export const loadExistingEvents = async (account: CalendarAccount): Promise<ExistingEvent[]> => {
	const posts = await prisma.posts.findMany({
		where: { usertoposts: { some: { userdetailsid: account.id } }, eventid: { not: null } },
		include: { events: true, posttypes: true },
	});

	const existing: ExistingEvent[] = [];
	for (const post of posts) {
		const sourceUrl = extractSourceUrl(post.content);
		if (!sourceUrl || !post.events?.eventdate) continue;
		existing.push({
			postId: post.id,
			eventId: post.events.id,
			sourceUrl,
			eventDate: post.events.eventdate,
			eventName: post.events.eventname,
			content: post.content,
			isPrivate: post.privatepost ?? false,
			edited: post.edited ?? false,
			rejected: post.posttypes.posttype === REJECTED_POST_TYPE,
		});
	}
	return existing;
};

export const createPrismaImportStore = (account: CalendarAccount, venueId: number): ImportStore => ({
	// Goes through the same save code the event form uses, so imported posts look like normal ones.
	create: async (input) => {
		await saveTrustedPost({
			content: input.content,
			lexical: input.lexical,
			userdetailsid: account.id,
			posttype: 'event',
			postfile: input.image?.filename,
			postfiletype: input.image?.filetype,
			isgalleryfile: false,
			// Always false for imports; a person editing the post in the app flips it to true.
			edited: false,
			privatepost: input.isPrivate,
			eventname: input.eventName,
			eventdate: input.eventDate,
			venueid: venueId,
		});
	},

	update: async ({ existing, eventName, eventDate, content, sendToPending }) => {
		if (eventName !== undefined || eventDate !== undefined) {
			await prisma.events.update({ where: { id: existing.eventId }, data: { eventname: eventName, eventdate: eventDate } });
		}
		await prisma.posts.update({
			where: { id: existing.postId },
			data: {
				content: content?.content,
				lexical: content?.lexical,
				// updatedat is only bumped when sending a post back to review; the review page uses it as a hint.
				...(sendToPending ? { privatepost: true, updatedat: new Date() } : {}),
			},
		});
	},
});
