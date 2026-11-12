import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { toEasternIso } from '../eastern';
import { createDjBradScottAdapter, findVenue } from './djbradscott';

const fixture = readFileSync(path.join(__dirname, '..', '__fixtures__', 'djbradscott-events.json'), 'utf8');
const getFixture = async (): Promise<string> => fixture;
const noReport = (): void => {};

describe('findVenue', () => {
	it('matches a known venue by name and by alias', () => {
		assert.equal(findVenue('Halloween at The Lafayette Bar', '')?.name, 'Lafayette Bar');
		assert.equal(findVenue('High Tea at Playhouse Deck', '')?.name, 'Bucks County Playhouse');
	});

	it('prefers the title over venues named in the text', () => {
		assert.equal(findVenue('SYNTHETIC PHL', 'Broad Hall 21+ with COVEN - Easton, PA')?.name, 'Broad Hall');
		assert.equal(findVenue('Birthday Bash', 'Lafayette Bar, Easton')?.name, 'Lafayette Bar');
		assert.equal(findVenue('Lafayette Bar night', 'Broad Hall tonight')?.name, 'Lafayette Bar');
	});

	it('returns null for an unknown venue', () => {
		assert.equal(findVenue('Pink Pony Club', 'A night out.'), null);
	});
});

describe('djbradscott adapter', () => {
	it('lists only upcoming events, with trimmed titles and Eastern start times', async () => {
		const items = await createDjBradScottAdapter().fetchListing(getFixture, noReport);

		assert.equal(items.length, 3);
		assert.equal(items[0].rawTitle, 'SYNTHETIC PHL');
		assert.equal(items[0].sourceUrl, 'https://www.djbradfscott.com/event-calendar/synthetic-phl-1');
		assert.equal(toEasternIso(items[0].startsAt), '2026-11-20T22:00:00-05:00');
		assert.equal(items[2].rawTitle, 'High Tea at Playhouse Deck');
	});

	it('serves detail from the listing, with the venue and without stylesheet text', async () => {
		const adapter = createDjBradScottAdapter();
		const items = await adapter.fetchListing(getFixture, noReport);
		const [phl, birthday, tea] = await Promise.all(items.map((item) => adapter.fetchDetail(item.sourceUrl, getFixture)));

		assert.equal(phl.venue?.name, 'Broad Hall');
		assert.equal(birthday.venue?.name, 'Lafayette Bar');
		assert.equal(tea.venue?.name, 'Bucks County Playhouse');
		assert.ok(phl.imageUrl?.startsWith('https://images.squarespace-cdn.com/'));
		assert.ok(birthday.description?.includes('BIRTHDAY'));
		for (const detail of [phl, birthday, tea]) assert.ok(!detail.description?.includes('--stroke-style'));
	});

	it('refuses a detail it did not list', async () => {
		const adapter = createDjBradScottAdapter();
		await adapter.fetchListing(getFixture, noReport);
		await assert.rejects(adapter.fetchDetail('https://www.djbradfscott.com/event-calendar/nope', getFixture), /no listing data/);
	});

	it('throws when the listing looks truncated', async () => {
		const full = JSON.stringify({ pagination: { pageSize: 1 }, upcoming: JSON.parse(fixture).upcoming });
		await assert.rejects(createDjBradScottAdapter().fetchListing(async () => full, noReport), /needs pagination/);
	});

	it('rejects a response that is not the expected shape', async () => {
		await assert.rejects(createDjBradScottAdapter().fetchListing(async () => '{"upcoming":"no"}', noReport));
	});
});
