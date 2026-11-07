import assert from 'node:assert/strict';
import { afterEach, describe, it, mock } from 'node:test';
import type { PoliteFetcher } from './http';
import { DETAIL_FETCH_CAP, runSource, runSources, scrapeSource } from './run';
import type { SaveRunInput, SnapshotStore } from './snapshots';
import type { Source } from './sources';
import type { ListingItem, RunIndexEntry, Snapshot } from './types';

const fakeFetcher = (): PoliteFetcher => ({
	getHtml: async () => '',
	stats: { requests: 0, failedRequests: 0 },
	errors: [],
});

const listingItem = (n: number): ListingItem => ({
	sourceUrl: `https://v.test/event/${n}/`,
	rawTitle: n === 0 ? '• SOLD OUT! • Show 0 – Tag' : `Show ${n}`,
	// 8 PM Eastern (standard time) on consecutive December days.
	startsAt: new Date(Date.UTC(2026, 11, 1 + n, 1)),
});

const makeSource = (count: number, detailCalls: string[] = []): Source => ({
	key: 'test',
	displayName: 'Test',
	venueName: 'Test',
	adapter: {
		fetchListing: async () => Array.from({ length: count }, (_, n) => listingItem(n)),
		fetchDetail: async (url) => {
			detailCalls.push(url);
			return { startsAt: null, imageUrl: `${url}img.png`, description: 'A description.' };
		},
	},
});

const failingSource = (key: string): Source => {
	const source = makeSource(1);
	return {
		...source,
		key,
		adapter: {
			...source.adapter,
			fetchListing: async () => {
				throw new Error('down');
			},
		},
	};
};

const emptyIndexEntry = {} as RunIndexEntry;

const memoryStore = () => {
	const state: { latest: Snapshot | null; runs: SaveRunInput[] } = { latest: null, runs: [] };
	const store: SnapshotStore = {
		readLatest: async () => state.latest,
		saveRun: async (input) => {
			state.runs.push(input);
			if (!input.failed) state.latest = input.snapshot;
			return emptyIndexEntry;
		},
	};
	return { state, store };
};

afterEach(() => mock.restoreAll());

describe('scrapeSource', () => {
	it('fills details for new events and cleans titles', async () => {
		const snapshot = await scrapeSource(makeSource(3), null, fakeFetcher(), new Date());
		assert.equal(snapshot.events.length, 3);
		assert.equal(snapshot.events[0].soldOut, true);
		assert.equal(snapshot.events[0].headline, 'Show 0');
		assert.equal(snapshot.events[0].imageUrl, 'https://v.test/event/0/img.png');
		assert.ok(snapshot.events[0].detailFetchedAt);
	});

	it('fetches at most 20 details per run and finishes the rest on the next run', async () => {
		const calls: string[] = [];
		const source = makeSource(25, calls);
		const first = await scrapeSource(source, null, fakeFetcher(), new Date());
		assert.equal(calls.length, DETAIL_FETCH_CAP);
		assert.equal(first.events.filter((event) => !event.detailFetchedAt).length, 5);

		calls.length = 0;
		await scrapeSource(source, first, fakeFetcher(), new Date());
		assert.equal(calls.length, 5);
	});

	it('keeps two events that share a URL on different dates apart', async () => {
		const source = makeSource(0);
		source.adapter.fetchListing = async () => [
			{ sourceUrl: 'https://v.test/event/open-mike/', rawTitle: 'Open Mike', startsAt: new Date('2026-12-07T00:00:00Z') },
			{ sourceUrl: 'https://v.test/event/open-mike/', rawTitle: 'Open Mike', startsAt: new Date('2027-01-04T00:00:00Z') },
		];
		const snapshot = await scrapeSource(source, null, fakeFetcher(), new Date());
		assert.equal(new Set(snapshot.events.map((event) => event.matchKey)).size, 2);
	});

	it('uses the detail page time and warns when it disagrees with the listing', async () => {
		const source = makeSource(1);
		source.adapter.fetchDetail = async () => ({
			startsAt: new Date('2026-12-02T01:00:00Z'),
			imageUrl: null,
			description: null,
		});
		const [event] = (await scrapeSource(source, null, fakeFetcher(), new Date())).events;
		assert.equal(event.startsAt, '2026-12-01T20:00:00-05:00');
		assert.deepEqual(event.warnings, ['no image', 'no description', 'listing and detail times differ']);
	});
});

describe('runSource', () => {
	it('a second run with no changes fetches no details and has an empty diff', async () => {
		const calls: string[] = [];
		const source = makeSource(5, calls);
		const { store, state } = memoryStore();

		await runSource(source, { store, save: true });
		assert.equal(calls.length, 5);

		calls.length = 0;
		const second = await runSource(source, { store, save: true });
		assert.equal(calls.length, 0);
		assert.deepEqual(second.diff, { newEvents: [], changed: [], missingPast: [], missingFuture: [] });
		assert.equal(state.runs.length, 2);
	});

	it('logs the layout-change error on zero events and does not overwrite latest', async () => {
		const errors: string[] = [];
		mock.method(console, 'error', (message: string) => errors.push(message));
		const { store, state } = memoryStore();
		await runSource(makeSource(3), { store, save: true });
		const goodLatest = state.latest;

		const result = await runSource(makeSource(0), { store, save: true });

		assert.equal(result.summary.failed, true);
		assert.ok(errors.includes('test: 0 events found, layout may have changed.'));
		assert.equal(state.latest, goodLatest);
		assert.equal(state.runs.at(-1)?.failed, true);
	});

	it('turns a listing exception into a failed run instead of throwing', async () => {
		mock.method(console, 'error', () => {});
		const result = await runSource(failingSource('test'), { save: false });
		assert.equal(result.summary.failed, true);
		assert.ok(result.summary.errors.includes('down'));
	});

	it('writes nothing when save is off', async () => {
		const { store, state } = memoryStore();
		const result = await runSource(makeSource(2), { store, save: false });
		assert.equal(result.summary.saved, false);
		assert.equal(state.runs.length, 0);
	});
});

describe('runSources', () => {
	it('keeps running the other sources when one fails', async () => {
		mock.method(console, 'error', () => {});
		mock.method(console, 'log', () => {});
		const results = await runSources({ save: false, sources: [failingSource('broken'), makeSource(2)] });
		assert.deepEqual(
			results.map((result) => [result.summary.sourceKey, result.summary.failed]),
			[
				['broken', true],
				['test', false],
			],
		);
	});
});
