import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { diffSnapshots } from './diff';
import type { ScrapedEvent } from './types';

const event = (overrides: Partial<ScrapedEvent> = {}): ScrapedEvent => ({
	sourceKey: 'godfrey',
	sourceUrl: 'https://example.com/event/a/',
	matchKey: 'https://example.com/event/a/#2026-12-01',
	startsAt: '2026-12-01T20:00:00-05:00',
	rawTitle: 'A',
	headline: 'A',
	tagline: null,
	soldOut: false,
	canceled: false,
	notices: [],
	description: 'desc',
	imageUrl: 'https://example.com/a.png',
	venue: null,
	detailFetchedAt: '2026-11-01T10:00:00Z',
	warnings: [],
	...overrides,
});

const now = new Date('2026-11-07T15:00:00Z');

describe('diffSnapshots', () => {
	it('is empty when nothing changed', () => {
		const diff = diffSnapshots([event()], [event()], now);
		assert.deepEqual(diff, { newEvents: [], changed: [], missingPast: [], missingFuture: [] });
	});

	it('reports new events', () => {
		assert.equal(diffSnapshots([], [event()], now).newEvents.length, 1);
	});

	it('reports time, sold out and canceled changes field by field', () => {
		const diff = diffSnapshots(
			[event()],
			[event({ startsAt: '2026-12-01T19:00:00-05:00', soldOut: true, canceled: true })],
			now,
		);
		assert.equal(diff.changed.length, 1);
		assert.deepEqual(
			diff.changed[0].changes.map((change) => change.field),
			['startsAt', 'soldOut', 'canceled'],
		);
		assert.deepEqual(diff.changed[0].changes[0], {
			field: 'startsAt',
			before: '2026-12-01T20:00:00-05:00',
			after: '2026-12-01T19:00:00-05:00',
		});
	});

	it('reports headline, description and image changes', () => {
		const diff = diffSnapshots([event()], [event({ headline: 'B', description: 'new', imageUrl: null })], now);
		assert.deepEqual(
			diff.changed[0].changes.map((change) => change.field),
			['headline', 'description', 'imageUrl'],
		);
	});

	it('ignores details that were still pending in the previous run', () => {
		const pending = event({ description: null, imageUrl: null, detailFetchedAt: null });
		assert.equal(diffSnapshots([pending], [event()], now).changed.length, 0);
	});

	it('splits missing events into past and future', () => {
		const past = event({ matchKey: 'p', startsAt: '2026-11-01T20:00:00-04:00' });
		const future = event({ matchKey: 'f', startsAt: '2026-12-01T20:00:00-05:00' });
		const diff = diffSnapshots([past, future], [], now);
		assert.deepEqual(diff.missingPast, [past]);
		assert.deepEqual(diff.missingFuture, [future]);
	});
});
