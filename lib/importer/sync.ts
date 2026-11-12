import { easternDate } from '../scraper/eastern';
import type { ScrapedEvent } from '../scraper/types';
import { stripHtml } from '../cards/text';
import { buildPostContent, hasSoldOutLine } from './postContent';

// An imported event as it currently exists in the database.
export type ExistingEvent = {
	postId: number;
	eventId: number;
	sourceUrl: string;
	eventDate: Date;
	eventName: string | null;
	content: string | null;
	isPrivate: boolean;
	edited: boolean;
	rejected: boolean;
};

export type SkipReason = 'canceled at source' | 'rejected' | 'details pending' | 'venue unresolved';

export type SyncAction =
	| { kind: 'create'; event: ScrapedEvent; isPrivate: boolean; venueId: number }
	| {
			kind: 'update';
			event: ScrapedEvent;
			existing: ExistingEvent;
			eventName?: string;
			eventDate?: Date;
			rewriteContent: boolean;
			sendToPending: boolean;
	  }
	| { kind: 'skip'; event: ScrapedEvent; reason: SkipReason };

export type StoredImage = { filename: string; filetype: string };

export type NewEventInput = {
	eventName: string;
	eventDate: Date;
	content: string;
	lexical: string;
	isPrivate: boolean;
	venueId: number;
	image: StoredImage | null;
};

export type UpdateEventInput = {
	existing: ExistingEvent;
	eventName?: string;
	eventDate?: Date;
	content?: { content: string; lexical: string };
	sendToPending: boolean;
};

// The database side of an import, so the rules can be tested without a database.
export type ImportStore = {
	create(input: NewEventInput): Promise<void>;
	update(input: UpdateEventInput): Promise<void>;
};

export const matchKeyFor = (sourceUrl: string, date: Date): string => `${sourceUrl}#${easternDate(date)}`;

// Rejected posts win, so a rejected event is never re-imported.
export const indexExisting = (existing: ExistingEvent[]): Map<string, ExistingEvent> => {
	const byKey = new Map<string, ExistingEvent>();
	for (const item of existing) {
		const key = matchKeyFor(item.sourceUrl, item.eventDate);
		const current = byKey.get(key);
		if (!current || (item.rejected && !current.rejected)) byKey.set(key, item);
	}
	return byKey;
};

const planForExisting = (event: ScrapedEvent, existing: ExistingEvent): SyncAction | null => {
	if (existing.rejected) return { kind: 'skip', event, reason: 'rejected' };

	if (event.canceled) {
		// Canceled events go back to pending so a person decides; an already-pending one needs nothing.
		if (existing.isPrivate) return null;
		return { kind: 'update', event, existing, rewriteContent: false, sendToPending: true };
	}

	const startsAt = new Date(event.startsAt);
	const timeChanged = existing.eventDate.getTime() !== startsAt.getTime();
	const titleChanged = existing.eventName !== event.headline;
	const soldOutChanged = hasSoldOutLine(existing.content) !== event.soldOut;

	// An admin's edits to the content are never overwritten, so for an edited post only the title and time count.
	const rewriteContent = (titleChanged || soldOutChanged) && !existing.edited;
	if (!timeChanged && !titleChanged && !rewriteContent) return null;

	return {
		kind: 'update',
		event,
		existing,
		eventName: titleChanged ? event.headline : undefined,
		eventDate: timeChanged ? startsAt : undefined,
		rewriteContent,
		sendToPending: timeChanged && !existing.isPrivate,
	};
};

export const planSync = (
	events: ScrapedEvent[],
	existing: ExistingEvent[],
	options: { autoPublish: boolean; venueIdFor: (event: ScrapedEvent) => number | null },
): SyncAction[] => {
	const existingByKey = indexExisting(existing);
	const actions: SyncAction[] = [];

	for (const event of events) {
		const found = existingByKey.get(matchKeyFor(event.sourceUrl, new Date(event.startsAt)));

		if (found) {
			const action = planForExisting(event, found);
			if (action) actions.push(action);
		} else if (event.canceled) {
			actions.push({ kind: 'skip', event, reason: 'canceled at source' });
		} else if (!event.detailFetchedAt) {
			// The scraper hasn't fetched this event's image and description yet; import it once it has.
			actions.push({ kind: 'skip', event, reason: 'details pending' });
		} else {
			// A post is never created without a venue; an admin resolves the venue and a later run picks the event up.
			const venueId = options.venueIdFor(event);
			if (venueId === null) actions.push({ kind: 'skip', event, reason: 'venue unresolved' });
			else actions.push({ kind: 'create', event, isPrivate: !options.autoPublish, venueId });
		}
	}
	return actions;
};

export type SyncCounts = { created: number; updated: number; sentToPending: number; skipped: number; imageFailures: number };

export const emptyCounts = (): SyncCounts => ({ created: 0, updated: 0, sentToPending: 0, skipped: 0, imageFailures: 0 });

export const countActions = (actions: SyncAction[]): SyncCounts => {
	const counts = emptyCounts();
	for (const action of actions) {
		if (action.kind === 'create') counts.created += 1;
		else if (action.kind === 'skip') counts.skipped += 1;
		else {
			if (action.eventName || action.eventDate || action.rewriteContent) counts.updated += 1;
			if (action.sendToPending) counts.sentToPending += 1;
		}
	}
	return counts;
};

// Applies the plan. A failure on one event is recorded and the rest still run.
export const applyActions = async (
	actions: SyncAction[],
	deps: { store: ImportStore; storeImage: (event: ScrapedEvent) => Promise<StoredImage | null> },
): Promise<{ counts: SyncCounts; errors: string[] }> => {
	const counts = countActions(actions);
	counts.created = 0;
	const errors: string[] = [];

	for (const action of actions) {
		try {
			if (action.kind === 'create') {
				const image = action.event.imageUrl ? await deps.storeImage(action.event) : null;
				if (action.event.imageUrl && !image) counts.imageFailures += 1;
				await deps.store.create({
					eventName: action.event.headline,
					eventDate: new Date(action.event.startsAt),
					...buildPostContent(action.event),
					isPrivate: action.isPrivate,
					venueId: action.venueId,
					image,
				});
				counts.created += 1;
			} else if (action.kind === 'update') {
				await deps.store.update({
					existing: action.existing,
					eventName: action.eventName,
					eventDate: action.eventDate,
					content: action.rewriteContent ? buildPostContent(action.event) : undefined,
					sendToPending: action.sendToPending,
				});
			}
		} catch (error) {
			errors.push(`${action.event.sourceUrl}: ${error instanceof Error ? error.message : String(error)}`);
		}
	}
	return { counts, errors };
};

export type PendingReason = 'New' | 'Time changed' | 'Canceled at source' | 'Edited by admin, source changed';

// Labels are worked out when the review page loads by comparing a post with the latest snapshot;
// nothing is stored. updatedat only moves past createdat when the importer sends a post back for
// review (or a person edits it), which is how a time change is told apart from a new event.
export const pendingReason = (
	post: { edited: boolean; createdat: Date; updatedat: Date; content: string | null },
	source: ScrapedEvent | undefined,
): PendingReason => {
	if (source?.canceled) return 'Canceled at source';

	if (post.edited && source) {
		const text = stripHtml(post.content ?? '');
		const missingText = [source.tagline, source.description].some((part) => part && !text.includes(part));
		if (missingText || hasSoldOutLine(post.content) !== source.soldOut) return 'Edited by admin, source changed';
	}
	return post.updatedat.getTime() > post.createdat.getTime() ? 'Time changed' : 'New';
};
