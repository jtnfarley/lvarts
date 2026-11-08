import { prisma } from '@/prisma';
import { blobSnapshotStore } from '../scraper/snapshots';
import type { ScrapedEvent } from '../scraper/types';
import { getCalendarAccount, REJECTED_POST_TYPE } from './db';
import { extractSourceUrl } from './postContent';
import { unusableSnapshotReason } from './run';
import { IMPORT_SOURCES } from './sources';
import { matchKeyFor, pendingReason, type PendingReason } from './sync';

export type PendingImport = {
	postId: number;
	eventId: number;
	eventName: string;
	eventDate: Date;
	venueName: string | null;
	content: string;
	sourceUrl: string | null;
	hasImage: boolean;
	reason: PendingReason;
};

export type MissingFromSource = {
	postId: number;
	eventName: string;
	eventDate: Date;
	sourceUrl: string;
};

export type ReviewData = {
	pending: PendingImport[];
	missing: MissingFromSource[];
	notes: string[];
};

const sameOrigin = (a: string, b: string): boolean => new URL(a).origin === new URL(b).origin;

// Reads the latest snapshots. A source whose snapshot is unusable is reported in notes and left out of the missing check.
const loadSnapshotEvents = async (): Promise<{ all: Map<string, ScrapedEvent>; fresh: ScrapedEvent[]; notes: string[] }> => {
	const all = new Map<string, ScrapedEvent>();
	const fresh: ScrapedEvent[] = [];
	const notes: string[] = [];

	for (const source of IMPORT_SOURCES) {
		try {
			const snapshot = await blobSnapshotStore.readLatest(source.scraperKey);
			const unusable = unusableSnapshotReason(snapshot, new Date());
			if (snapshot) {
				for (const event of snapshot.events) all.set(event.matchKey, event);
			}
			if (unusable || !snapshot) notes.push(`${source.scraperKey}: ${unusable}. Labels may be out of date and the missing-event check is skipped.`);
			else fresh.push(...snapshot.events);
		} catch (error) {
			notes.push(`${source.scraperKey}: could not read the snapshot (${error instanceof Error ? error.message : String(error)}).`);
		}
	}
	return { all, fresh, notes };
};

export const getReviewData = async (): Promise<ReviewData> => {
	const account = await getCalendarAccount();
	const now = new Date();
	const ofCalendarAccount = { usertoposts: { some: { userdetailsid: account.id } }, eventid: { not: null } };

	const [pendingPosts, publishedPosts, snapshots] = await Promise.all([
		prisma.posts.findMany({
			where: {
				...ofCalendarAccount,
				privatepost: true,
				posttypes: { posttype: { not: REJECTED_POST_TYPE } },
				events: { eventdate: { gte: now } },
			},
			include: { events: { include: { venues: true } } },
			orderBy: { events: { eventdate: 'asc' } },
		}),
		prisma.posts.findMany({
			where: { ...ofCalendarAccount, privatepost: { not: true }, events: { eventdate: { gte: now } } },
			include: { events: true },
			orderBy: { events: { eventdate: 'asc' } },
		}),
		loadSnapshotEvents(),
	]);

	const pending: PendingImport[] = [];
	for (const post of pendingPosts) {
		if (!post.events?.eventdate) continue;
		const sourceUrl = extractSourceUrl(post.content);
		const source = sourceUrl ? snapshots.all.get(matchKeyFor(sourceUrl, post.events.eventdate)) : undefined;
		pending.push({
			postId: post.id,
			eventId: post.events.id,
			eventName: post.events.eventname ?? '(untitled)',
			eventDate: post.events.eventdate,
			venueName: post.events.venues?.venuename ?? null,
			content: post.content ?? '',
			sourceUrl,
			hasImage: Boolean(post.postfile),
			reason: pendingReason(
				{ edited: post.edited ?? false, createdat: post.createdat, updatedat: post.updatedat, content: post.content },
				source,
			),
		});
	}

	const freshKeys = new Set(snapshots.fresh.map((event) => event.matchKey));
	const missing: MissingFromSource[] = [];
	for (const post of publishedPosts) {
		const sourceUrl = extractSourceUrl(post.content);
		if (!sourceUrl || !post.events?.eventdate) continue;
		// Only judge events from a venue whose snapshot is fresh.
		const fromFreshSource = snapshots.fresh.some((event) => sameOrigin(event.sourceUrl, sourceUrl));
		if (fromFreshSource && !freshKeys.has(matchKeyFor(sourceUrl, post.events.eventdate))) {
			missing.push({ postId: post.id, eventName: post.events.eventname ?? '(untitled)', eventDate: post.events.eventdate, sourceUrl });
		}
	}

	return { pending, missing, notes: snapshots.notes };
};
