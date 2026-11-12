import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import type { ScrapedEvent, Snapshot } from '../scraper/types';
import { buildPostContent } from './postContent';
import { pendingReason, planSync, type ExistingEvent, type SyncAction } from './sync';

const snapshot: Snapshot = JSON.parse(readFileSync(path.join(__dirname, '__fixtures__', 'snapshot.json'), 'utf8'));

const fixture = (slug: string, date?: string): ScrapedEvent => {
	const found = snapshot.events.find((event) => event.sourceUrl.includes(`/${slug}/`) && (!date || event.matchKey.endsWith(date)));
	assert.ok(found, `no fixture event ${slug}`);
	return found;
};

// What the database holds after an earlier import of the same event.
const existingFor = (event: ScrapedEvent, overrides: Partial<ExistingEvent> = {}): ExistingEvent => ({
	postId: 1,
	eventId: 1,
	sourceUrl: event.sourceUrl,
	eventDate: new Date(event.startsAt),
	eventName: event.headline,
	content: buildPostContent(event).content,
	isPrivate: false,
	edited: false,
	rejected: false,
	...overrides,
});

const VENUE_ID = 7;

const plan = (
	events: ScrapedEvent[],
	existing: ExistingEvent[] = [],
	autoPublish = false,
	venueIdFor: (event: ScrapedEvent) => number | null = () => VENUE_ID,
): SyncAction[] => planSync(events, existing, { autoPublish, venueIdFor });

const only = (actions: SyncAction[]): SyncAction => {
	assert.equal(actions.length, 1, `expected one action, got ${JSON.stringify(actions.map((action) => action.kind))}`);
	return actions[0];
};

describe('new events', () => {
	it('creates the event at the venue the source resolves', () => {
		const action = only(plan([fixture('new-show')]));
		assert.equal(action.kind === 'create' && action.venueId, VENUE_ID);
	});

	it('skips a new event whose venue is unresolved instead of creating it', () => {
		const action = only(plan([fixture('new-show')], [], false, () => null));
		assert.deepEqual(action.kind === 'skip' && action.reason, 'venue unresolved');
	});

	it('does not need a venue for an event that already exists', () => {
		const event = fixture('unchanged');
		assert.deepEqual(plan([event], [existingFor(event)], false, () => null), []);
	});

	it('creates a new event as pending', () => {
		const action = only(plan([fixture('new-show')]));
		assert.equal(action.kind, 'create');
		assert.equal(action.kind === 'create' && action.isPrivate, true);
	});

	it('creates it published when the source auto-publishes', () => {
		const action = only(plan([fixture('new-show')], [], true));
		assert.equal(action.kind === 'create' && action.isPrivate, false);
	});

	it('skips a new event that is canceled at source', () => {
		const action = only(plan([fixture('new-canceled')]));
		assert.deepEqual([action.kind, action.kind === 'skip' && action.reason], ['skip', 'canceled at source']);
	});

	it('waits for the scraper to fetch details before importing', () => {
		const action = only(plan([fixture('details-pending')]));
		assert.deepEqual([action.kind, action.kind === 'skip' && action.reason], ['skip', 'details pending']);
	});

	it('imports two open mike nights with the same URL as two events', () => {
		const actions = plan([fixture('open-mike', '2026-12-06'), fixture('open-mike', '2027-01-03')]);
		assert.deepEqual(
			actions.map((action) => action.kind),
			['create', 'create'],
		);
	});

	it('matches open mike nights by date, not by URL alone', () => {
		const december = fixture('open-mike', '2026-12-06');
		const actions = plan([december, fixture('open-mike', '2027-01-03')], [existingFor(december)]);
		assert.deepEqual(
			actions.map((action) => [action.kind, action.event.matchKey.slice(-10)]),
			[['create', '2027-01-03']],
		);
	});
});

describe('existing events', () => {
	it('does nothing when nothing changed', () => {
		const event = fixture('unchanged');
		assert.deepEqual(plan([event], [existingFor(event)]), []);
	});

	it('updates a changed title and content but keeps the published state', () => {
		const event = fixture('title-changed');
		const action = only(plan([event], [existingFor(event, { eventName: 'Old Name' })]));
		assert.ok(action.kind === 'update');
		assert.equal(action.eventName, 'Renamed Show');
		assert.equal(action.rewriteContent, true);
		assert.equal(action.sendToPending, false);
		assert.equal(action.eventDate, undefined);
	});

	it('updates content when the sold out notice appears', () => {
		const event = fixture('sold-out-changed');
		const before = existingFor(event, { content: buildPostContent({ ...event, soldOut: false }).content });
		const action = only(plan([event], [before]));
		assert.ok(action.kind === 'update');
		assert.equal(action.rewriteContent, true);
		assert.equal(action.eventName, undefined);
		assert.equal(action.sendToPending, false);
	});

	it('updates a changed time and sends a published post back to pending', () => {
		const event = fixture('time-changed');
		const before = existingFor(event, { eventDate: new Date('2026-12-05T19:00:00-05:00') });
		const action = only(plan([event], [before]));
		assert.ok(action.kind === 'update');
		assert.equal(action.eventDate?.toISOString(), new Date(event.startsAt).toISOString());
		assert.equal(action.sendToPending, true);
	});

	it('updates a changed time on an already pending post without changing its state', () => {
		const event = fixture('time-changed');
		const before = existingFor(event, { eventDate: new Date('2026-12-05T19:00:00-05:00'), isPrivate: true });
		const action = only(plan([event], [before]));
		assert.ok(action.kind === 'update');
		assert.equal(action.sendToPending, false);
	});

	it('sends a published post back to pending when canceled at source', () => {
		const event = fixture('canceled-published');
		const action = only(plan([event], [existingFor(event)]));
		assert.ok(action.kind === 'update');
		assert.equal(action.sendToPending, true);
		assert.equal(action.rewriteContent, false);
		assert.equal(action.eventName, undefined);
	});

	it('leaves an already pending canceled post alone', () => {
		const event = fixture('canceled-pending');
		assert.deepEqual(plan([event], [existingFor(event, { isPrivate: true })]), []);
	});

	it('skips a rejected event even when its details changed', () => {
		const event = fixture('rejected');
		const before = existingFor(event, { rejected: true, isPrivate: true, eventName: 'Old Name' });
		const action = only(plan([event], [before]));
		assert.deepEqual([action.kind, action.kind === 'skip' && action.reason], ['skip', 'rejected']);
	});

	it('skips a rejected event that is canceled at source too', () => {
		const event = fixture('canceled-published');
		const action = only(plan([event], [existingFor(event, { rejected: true, isPrivate: true })]));
		assert.equal(action.kind, 'skip');
	});

	it('does not overwrite an admin-edited post: only the title and time change', () => {
		const event = fixture('admin-edited');
		const before = existingFor(event, {
			edited: true,
			eventName: 'Old Name',
			eventDate: new Date('2026-12-11T19:00:00-05:00'),
			content: buildPostContent({ ...event, soldOut: false }).content,
		});
		const action = only(plan([event], [before]));
		assert.ok(action.kind === 'update');
		assert.equal(action.eventName, 'Admin Edited New Title');
		assert.ok(action.eventDate);
		assert.equal(action.rewriteContent, false);
	});

	it('does not touch an admin-edited post whose title and time already match', () => {
		const event = fixture('admin-edited');
		const before = existingFor(event, {
			edited: true,
			content: buildPostContent({ ...event, soldOut: false }).content,
		});
		assert.deepEqual(plan([event], [before]), []);
	});
});

describe('events missing from the snapshot', () => {
	it('changes nothing for future or past events that the listing dropped', () => {
		const future = fixture('unchanged');
		const past = { ...fixture('unchanged'), sourceUrl: 'https://venue.test/event/old/', startsAt: '2020-01-01T20:00:00-05:00' };
		const existing = [existingFor(future), existingFor(past, { postId: 2, eventId: 2 })];
		assert.deepEqual(plan([], existing), []);
	});
});

describe('pendingReason', () => {
	const created = new Date('2026-11-08T10:00:00Z');
	const post = (overrides: Partial<Parameters<typeof pendingReason>[0]> = {}) => ({
		edited: false,
		createdat: created,
		updatedat: created,
		content: buildPostContent(fixture('unchanged')).content,
		...overrides,
	});

	it('labels an untouched pending post as new', () => {
		assert.equal(pendingReason(post(), fixture('unchanged')), 'New');
	});

	it('labels a post that was sent back for review as a time change', () => {
		assert.equal(pendingReason(post({ updatedat: new Date('2026-11-09T10:00:00Z') }), fixture('unchanged')), 'Time changed');
	});

	it('labels a canceled event, ahead of any other reason', () => {
		assert.equal(pendingReason(post({ updatedat: new Date('2026-11-09T10:00:00Z') }), fixture('canceled-pending')), 'Canceled at source');
	});

	it('flags an admin-edited post whose source no longer matches', () => {
		const soldOutNow = { ...fixture('unchanged'), soldOut: true };
		assert.equal(pendingReason(post({ edited: true }), soldOutNow), 'Edited by admin, source changed');
		assert.equal(pendingReason(post({ edited: true }), fixture('unchanged')), 'New');
	});
});
