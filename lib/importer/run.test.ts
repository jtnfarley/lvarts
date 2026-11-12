import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, describe, it, mock } from 'node:test';
import type { ScrapedEvent, Snapshot } from '../scraper/types';
import { extractSourceUrl } from './postContent';
import { importSource, MAX_SNAPSHOT_AGE_MS, unusableSnapshotReason, type ImportDeps } from './run';
import { shouldAutoPublish } from './sources';
import { type ExistingEvent, type ImportStore } from './sync';

const baseSnapshot: Snapshot = JSON.parse(readFileSync(path.join(__dirname, '__fixtures__', 'snapshot.json'), 'utf8'));
const source = { scraperKey: 'test', venue: 'fixed' as const, venueName: 'Test Venue', autoPublish: false };
const now = new Date('2026-11-08T10:30:00.000Z');

const memoryStore = (initial: ExistingEvent[] = []) => {
	const rows = [...initial];
	let nextId = 100;
	const store: ImportStore = {
		create: async (input) => {
			rows.push({
				postId: nextId,
				eventId: nextId++,
				sourceUrl: extractSourceUrl(input.content) ?? '',
				eventDate: input.eventDate,
				eventName: input.eventName,
				content: input.content,
				isPrivate: input.isPrivate,
				edited: false,
				rejected: false,
			});
		},
		update: async ({ existing, eventName, eventDate, content, sendToPending }) => {
			const row = rows.find((candidate) => candidate.postId === existing.postId)!;
			if (eventName) row.eventName = eventName;
			if (eventDate) row.eventDate = eventDate;
			if (content) row.content = content.content;
			if (sendToPending) row.isPrivate = true;
		},
	};
	return { rows, store };
};

const depsFor = (snapshot: Snapshot | null, memory = memoryStore(), storeImage: ImportDeps['storeImage'] = async () => null): ImportDeps => ({
	snapshots: { readLatest: async () => snapshot },
	loadExisting: async () => memory.rows,
	store: memory.store,
	venueIdFor: () => 1,
	storeImage,
	now,
});

// Keep only the events a test cares about.
const withEvents = (slugs: string[]): Snapshot => ({
	...baseSnapshot,
	events: baseSnapshot.events.filter((event) => slugs.some((slug) => event.sourceUrl.includes(`/${slug}/`))),
});

afterEach(() => mock.restoreAll());

describe('unusableSnapshotReason', () => {
	it('accepts a fresh, healthy snapshot', () => {
		assert.equal(unusableSnapshotReason(baseSnapshot, now), null);
	});

	it('rejects a missing, stale, empty, failed or wrong-version snapshot', () => {
		const stale = { ...baseSnapshot, finishedAt: new Date(now.getTime() - MAX_SNAPSHOT_AGE_MS - 1000).toISOString() };
		assert.match(unusableSnapshotReason(null, now) ?? '', /no snapshot/);
		assert.match(unusableSnapshotReason(stale, now) ?? '', /older than 36 hours/);
		assert.match(unusableSnapshotReason({ ...baseSnapshot, events: [] }, now) ?? '', /no events/);
		assert.match(unusableSnapshotReason({ ...baseSnapshot, stats: { requests: 4, failedRequests: 3, detailsFetched: 0 } }, now) ?? '', /failed/);
		assert.match(unusableSnapshotReason({ ...baseSnapshot, schemaVersion: 99 }, now) ?? '', /schema version/);
	});
});

describe('importSource', () => {
	it('skips a stale snapshot, logs it as an error and writes nothing', async () => {
		const errors: string[] = [];
		mock.method(console, 'error', (message: string) => errors.push(message));
		const memory = memoryStore();
		const stale = { ...baseSnapshot, finishedAt: '2026-11-01T00:00:00.000Z' };

		const { summary } = await importSource(source, depsFor(stale, memory), { dryRun: false });

		assert.ok(summary.skippedBecause);
		assert.equal(memory.rows.length, 0);
		assert.ok(errors.some((message) => message.startsWith('test: no fresh snapshot, import skipped')));
	});

	it('importing twice from the same snapshot creates no duplicates', async () => {
		const snapshot = withEvents(['new-show', 'open-mike', 'unchanged']);
		const memory = memoryStore();

		const first = await importSource(source, depsFor(snapshot, memory), { dryRun: false });
		assert.equal(first.summary.created, 4);
		assert.equal(memory.rows.length, 4);

		const second = await importSource(source, depsFor(snapshot, memory), { dryRun: false });
		assert.equal(second.summary.created, 0);
		assert.deepEqual(second.actions, []);
		assert.equal(memory.rows.length, 4);
	});

	it('creates new posts as pending unless the source auto-publishes', async () => {
		const snapshot = withEvents(['new-show']);
		const pending = memoryStore();
		await importSource(source, depsFor(snapshot, pending), { dryRun: false });
		assert.equal(pending.rows[0].isPrivate, true);

		const published = memoryStore();
		await importSource({ ...source, autoPublish: true }, depsFor(snapshot, published), { dryRun: false });
		assert.equal(published.rows[0].isPrivate, false);
	});

	it('honors the IMPORT_AUTO_PUBLISH=off kill switch', () => {
		const autoSource = { ...source, autoPublish: true };
		assert.equal(shouldAutoPublish(autoSource), true);
		process.env.IMPORT_AUTO_PUBLISH = 'off';
		try {
			assert.equal(shouldAutoPublish(autoSource), false);
		} finally {
			delete process.env.IMPORT_AUTO_PUBLISH;
		}
	});

	it('creates a new event at the venue the deps resolve for it', async () => {
		const memory = memoryStore();
		const created: number[] = [];
		const store: ImportStore = { ...memory.store, create: async (input) => { created.push(input.venueId); await memory.store.create(input); } };
		const deps = { ...depsFor(withEvents(['new-show']), { ...memory, store }), venueIdFor: () => 42 };
		await importSource(source, deps, { dryRun: false });
		assert.deepEqual(created, [42]);
	});

	it('creates nothing for an event whose venue is unresolved and reports it as skipped', async () => {
		const memory = memoryStore();
		const deps = { ...depsFor(withEvents(['new-show']), memory), venueIdFor: () => null };
		const { summary, actions } = await importSource(source, deps, { dryRun: false });
		assert.equal(summary.created, 0);
		assert.equal(summary.skipped, 1);
		assert.equal(actions[0].kind === 'skip' && actions[0].reason, 'venue unresolved');
		assert.equal(memory.rows.length, 0);
	});

	it('a dry run plans the work and writes nothing', async () => {
		const memory = memoryStore();
		const { summary, actions } = await importSource(source, depsFor(withEvents(['new-show']), memory), { dryRun: true });
		assert.equal(summary.created, 1);
		assert.equal(actions.length, 1);
		assert.equal(memory.rows.length, 0);
	});

	it('skips canceled new events and sends a published canceled event back to pending', async () => {
		const memory = memoryStore();
		const snapshot = withEvents(['canceled-published', 'new-canceled']);
		await importSource({ ...source, autoPublish: true }, depsFor({ ...snapshot, events: [{ ...snapshot.events[0], canceled: false }] }, memory), { dryRun: false });
		assert.equal(memory.rows[0].isPrivate, false);

		const second = await importSource(source, depsFor(snapshot, memory), { dryRun: false });
		assert.equal(second.summary.skipped, 1);
		assert.equal(second.summary.sentToPending, 1);
		assert.equal(memory.rows.length, 1);
		assert.equal(memory.rows[0].isPrivate, true);
	});

	it('does not re-import a rejected event on the next run', async () => {
		const snapshot = withEvents(['rejected']);
		const memory = memoryStore();
		await importSource(source, depsFor(snapshot, memory), { dryRun: false });
		memory.rows[0].rejected = true;

		const next = await importSource(source, depsFor(snapshot, memory), { dryRun: false });
		assert.equal(next.summary.created, 0);
		assert.equal(next.summary.skipped, 1);
		assert.equal(memory.rows.length, 1);
	});

	it('still creates the post when its image cannot be stored, and counts the failure', async () => {
		const memory = memoryStore();
		const { summary } = await importSource(source, depsFor(withEvents(['new-show']), memory), { dryRun: false });
		assert.equal(summary.created, 1);
		assert.equal(summary.imageFailures, 1);
	});

	it('passes the stored image to the new post', async () => {
		const images: (ScrapedEvent['imageUrl'])[] = [];
		const memory = memoryStore();
		const storeImage: ImportDeps['storeImage'] = async (event) => {
			images.push(event.imageUrl);
			return { filename: 'x.png', filetype: 'image/png' };
		};
		const { summary } = await importSource(source, depsFor(withEvents(['new-show']), memory, storeImage), { dryRun: false });
		assert.deepEqual(images, ['https://venue.test/img/new-show.png']);
		assert.equal(summary.imageFailures, 0);
	});

	it('records an error for one failing event and still imports the rest', async () => {
		const memory = memoryStore();
		const failing: ImportStore = {
			...memory.store,
			create: async (input) => {
				if (input.eventName === 'New Show') throw new Error('database down');
				return memory.store.create(input);
			},
		};
		const deps = { ...depsFor(withEvents(['new-show', 'unchanged']), memory), store: failing };

		const { summary } = await importSource(source, deps, { dryRun: false });

		assert.equal(summary.created, 1);
		assert.equal(summary.errors.length, 1);
		assert.match(summary.errors[0], /database down/);
	});

	it('returns an error summary instead of throwing when loading fails', async () => {
		mock.method(console, 'error', () => {});
		const deps = { ...depsFor(baseSnapshot), loadExisting: async (): Promise<ExistingEvent[]> => { throw new Error('no database'); } };
		const { summary } = await importSource(source, deps, { dryRun: false });
		assert.deepEqual(summary.errors, ['no database']);
	});
});
