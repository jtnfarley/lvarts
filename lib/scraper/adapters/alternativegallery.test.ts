import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { toEasternIso } from '../eastern';
import { createAlternativeGalleryAdapter, findVenue } from './alternativegallery';

const fixture = readFileSync(path.join(__dirname, '..', '__fixtures__', 'alternativegallery-events.json'), 'utf8');
const getFixture = async (): Promise<string> => fixture;
const noReport = (): void => {};

describe('findVenue', () => {
	it('defaults to the gallery', () => {
		assert.equal(findVenue('Metal Assault - December')?.name, 'The Alternative Gallery');
	});

	it('uses the place named after an @ in the title', () => {
		assert.deepEqual(findVenue('Open World Animation Festival @ The Roxy Theater'), { name: 'The Roxy Theater' });
	});
});

describe('alternativegallery adapter', () => {
	it('lists upcoming events with Eastern start times', async () => {
		const items = await createAlternativeGalleryAdapter().fetchListing(getFixture, noReport);

		assert.equal(items.length, 4);
		assert.equal(items[0].sourceUrl, 'https://www.thealternativegallery.com/events/allentown-comedy-w-jay-simpson-rebecca-kaplan-stephen-naab');
		assert.equal(toEasternIso(items[0].startsAt), '2026-11-21T19:00:00-05:00');
		assert.equal(items[2].rawTitle, 'Metal Assault - December');
	});

	it('serves detail from the listing, at the gallery, without stylesheet text', async () => {
		const adapter = createAlternativeGalleryAdapter();
		const items = await adapter.fetchListing(getFixture, noReport);
		const details = await Promise.all(items.map((item) => adapter.fetchDetail(item.sourceUrl, getFixture)));

		for (const detail of details) {
			assert.equal(detail.venue?.name, 'The Alternative Gallery');
			assert.ok(detail.imageUrl?.startsWith('https://images.squarespace-cdn.com/'));
			assert.ok(!detail.description?.includes('mix-blend-mode'));
		}
		assert.ok(details[0].description?.includes('$10 admission'));
	});

	it('refuses a detail it did not list', async () => {
		const adapter = createAlternativeGalleryAdapter();
		await adapter.fetchListing(getFixture, noReport);
		await assert.rejects(adapter.fetchDetail('https://www.thealternativegallery.com/events/nope', getFixture), /no listing data/);
	});

	it('throws when the listing looks truncated', async () => {
		const full = JSON.stringify({ pagination: { pageSize: 1 }, upcoming: JSON.parse(fixture).upcoming });
		await assert.rejects(createAlternativeGalleryAdapter().fetchListing(async () => full, noReport), /needs pagination/);
	});

	it('rejects a response that is not the expected shape', async () => {
		await assert.rejects(createAlternativeGalleryAdapter().fetchListing(async () => '{"upcoming":"no"}', noReport));
	});
});
