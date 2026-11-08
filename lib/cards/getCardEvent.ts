import { Prisma } from '@prisma/client';
import { prisma } from '@/prisma';
import imageUrl from '@/constants/imageUrl';
import { theme } from './theme';
import { cleanText, SNIPPET_LENGTH, truncate, VENUE_LENGTH } from './text';

export type CardEvent = {
	id: number;
	title: string;
	date: Date | null;
	venueName?: string;
	town?: string;
	snippet?: string;
	imageUrl?: string;
	// Site event page, shown in the card footer.
	url: string;
};

export type SkipReason = 'private only' | 'no title';

export type CardEventResult =
	| { ok: true; event: CardEvent }
	| { ok: false; id: number; title?: string; reason: SkipReason };

const eventInclude = {
	venues: { include: { cities: true } },
	posts: {
		orderBy: { createdat: 'asc' },
		include: {
			filetypes: true,
			usertoposts: {
				orderBy: { id: 'asc' },
				take: 1,
				include: { userdetails: { select: { userdir: true } } },
			},
		},
	},
} satisfies Prisma.eventsInclude;

export type EventRow = Prisma.eventsGetPayload<{ include: typeof eventInclude }>;
type PostRow = EventRow['posts'][number];

const postImageUrl = (post: PostRow): string | undefined => {
	const userdir = post.usertoposts[0]?.userdetails.userdir;
	const isImage = post.filetypes?.filetype.startsWith('image/');
	if (!post.postfile || !userdir || !isImage) return undefined;
	return `${imageUrl}/${userdir}/${encodeURIComponent(post.postfile)}`;
};

// includePrivate is for the admin preview of events waiting for review.
export const toCardEvent = (row: EventRow, includePrivate = false): CardEventResult => {
	const publicPosts = includePrivate ? row.posts : row.posts.filter((post) => !post.privatepost);
	const primaryPost = publicPosts[0];
	if (!primaryPost) return { ok: false, id: row.id, title: row.eventname ?? undefined, reason: 'private only' };

	const postText = cleanText(primaryPost.content ?? '');
	const firstLine = cleanText((primaryPost.content ?? '').split(/<\/p>|<br\s*\/?>|\n/i)[0]);
	const title = cleanText(row.eventname ?? '') || firstLine;
	if (!title) return { ok: false, id: row.id, reason: 'no title' };

	const venueName = row.venues?.venuename ? truncate(cleanText(row.venues.venuename), VENUE_LENGTH) : undefined;

	return {
		ok: true,
		event: {
			id: row.id,
			title,
			date: row.eventdate,
			venueName: venueName || undefined,
			town: row.venues?.cities?.city || undefined,
			snippet: postText ? truncate(postText, SNIPPET_LENGTH) : undefined,
			imageUrl: publicPosts.map(postImageUrl).find(Boolean),
			url: `${theme.siteName}/post/${primaryPost.id}`,
		},
	};
};

export const getCardEvent = async (id: number, includePrivate = false): Promise<CardEventResult | null> => {
	const row = await prisma.events.findUnique({ where: { id }, include: eventInclude });
	return row ? toCardEvent(row, includePrivate) : null;
};

export const getCardEventsBetween = async (startsAt: Date, endsAt: Date): Promise<CardEventResult[]> => {
	const rows = await prisma.events.findMany({
		where: { eventdate: { gte: startsAt, lt: endsAt } },
		orderBy: [{ eventdate: 'asc' }, { id: 'asc' }],
		include: eventInclude,
	});
	return rows.map((row) => toCardEvent(row));
};
