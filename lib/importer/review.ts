import { prisma } from '@/prisma';
import { blobSnapshotStore } from '../scraper/snapshots';
import type { ScrapedEvent, ScrapedVenue } from '../scraper/types';
import { getCalendarAccount, loadExistingEvents, loadVenueLookup, REJECTED_POST_TYPE, type CalendarAccount } from './db';
import { extractSourceUrl } from './postContent';
import { unusableSnapshotReason } from './run';
import { IMPORT_SOURCES } from './sources';
import { matchKeyFor, pendingReason, planSync, type PendingReason } from './sync';
import { resolveVenueId, venueLookupKey } from './venues';

export type PendingImport = {
	postId: number;
	eventId: number;
	eventName: string;
	eventDate: Date;
	venueName: string | null;
	venueCity: string | null;
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

// Events of one source that name (or lack) the same unknown venue, so an admin answers once for all of them.
export type UnresolvedVenue = {
	sourceKey: string;
	lookupKey: string;
	// What the scraper found, to prefill the create form; null when it found nothing.
	venue: ScrapedVenue | null;
	label: string;
	events: { headline: string; startsAt: string; sourceUrl: string }[];
};

export type VenueOption = { id: number; name: string; city: string | null };

export type ReviewData = {
	unresolvedVenues: UnresolvedVenue[];
	venueOptions: VenueOption[];
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

// Asks the importer's own planner which events it would skip for want of a venue, so this list cannot drift from it.
const findUnresolvedVenues = async (
	account: CalendarAccount,
	fresh: ScrapedEvent[],
): Promise<{ groups: UnresolvedVenue[]; venueOptions: VenueOption[] }> => {
	const perEventSources = IMPORT_SOURCES.filter((source) => source.venue === 'per-event');
	if (perEventSources.length === 0) return { groups: [], venueOptions: [] };

	const existing = await loadExistingEvents(account);
	const groups = new Map<string, UnresolvedVenue>();
	let venueOptions: VenueOption[] = [];

	for (const source of perEventSources) {
		const lookup = await loadVenueLookup(source.scraperKey);
		venueOptions = lookup.venues;
		const events = fresh.filter((event) => event.sourceKey === source.scraperKey);
		const actions = planSync(events, existing, { autoPublish: false, venueIdFor: (event) => resolveVenueId(lookup, event) });

		for (const action of actions) {
			if (action.kind !== 'skip' || action.reason !== 'venue unresolved') continue;
			const lookupKey = venueLookupKey(action.event);
			const groupKey = `${source.scraperKey}|${lookupKey}`;
			const group = groups.get(groupKey) ?? {
				sourceKey: source.scraperKey,
				lookupKey,
				venue: action.event.venue,
				label: action.event.venue?.name ?? action.event.headline,
				events: [],
			};
			group.events.push({ headline: action.event.headline, startsAt: action.event.startsAt, sourceUrl: action.event.sourceUrl });
			groups.set(groupKey, group);
		}
	}

	return { groups: [...groups.values()], venueOptions: venueOptions.sort((a, b) => a.name.localeCompare(b.name)) };
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
			include: { events: { include: { venues: { include: { cities: true } } } } },
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
			venueCity: post.events.venues?.cities?.city ?? null,
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

	const unresolved = await findUnresolvedVenues(account, snapshots.fresh);
	return { unresolvedVenues: unresolved.groups, venueOptions: unresolved.venueOptions, pending, missing, notes: snapshots.notes };
};
