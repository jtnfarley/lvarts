import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { toEasternIso } from '../eastern';
import { cleanTitle } from '../titles';
import { createInkwellAdapter, normalizeTitle, parseVariantStart } from './inkwell';

const fixtureJson = readFileSync(path.join(__dirname, '..', '__fixtures__', 'inkwell-products.json'), 'utf8');
const NOW = new Date('2026-11-11T15:00:00Z');

const start = (title: string): string => {
	const parsed = parseVariantStart(title, NOW);
	assert.ok(parsed, `could not parse "${title}"`);
	return toEasternIso(parsed.startsAt);
};

describe('parseVariantStart', () => {
	it('parses the full-date format', () => {
		assert.equal(start('November 27, 2026 08:00 PM / General Admission'), '2026-11-27T20:00:00-05:00');
	});

	it('parses ordinals, weekdays and short times', () => {
		assert.equal(start('November 29th, 2026 02:00 PM / Laughs'), '2026-11-29T14:00:00-05:00');
		assert.equal(start('Tuesday, November 25th 2026 | 7 PM / General Admission'), '2026-11-25T19:00:00-05:00');
	});

	it('assumes the next occurrence when the year is missing', () => {
		const parsed = parseVariantStart('December 4th | 8 PM / General Admission', NOW);
		assert.equal(toEasternIso(parsed!.startsAt), '2026-12-04T20:00:00-05:00');
		assert.equal(parsed!.yearAssumed, true);
		assert.equal(start('January 9th | 8 PM / General Admission'), '2027-01-09T20:00:00-05:00');
	});

	it('returns null for variants without a date', () => {
		assert.equal(parseVariantStart('Default Title', NOW), null);
		assert.equal(parseVariantStart('General Admission', NOW), null);
	});
});

describe('normalizeTitle', () => {
	it('turns the pipe into a tagline separator', () => {
		assert.deepEqual(cleanTitle(normalizeTitle('"Brew Ha Ha." | Comedy Over Coffee')), {
			headline: '"Brew Ha Ha."',
			tagline: 'Comedy Over Coffee',
			soldOut: false,
			canceled: false,
			notices: [],
		});
	});

	it('drops a quote that is never closed', () => {
		assert.equal(normalizeTitle('"Spilled Ink. | Open Mic Poetry Reading'), 'Spilled Ink. – Open Mic Poetry Reading');
	});
});

describe('inkwell adapter', () => {
	const adapter = createInkwellAdapter(() => NOW);
	const notes: string[] = [];
	const listing = adapter.fetchListing(async () => fixtureJson, (message) => notes.push(message));

	it('makes one event per product per date, so price tiers collapse', async () => {
		const items = await listing;
		const brewHaHa = items.filter((item) => item.sourceUrl.endsWith('/brew-ha-ha-comedy-over-coffee-4'));
		assert.deepEqual(brewHaHa.map((item) => toEasternIso(item.startsAt)), [
			'2026-11-29T14:00:00-05:00',
			'2026-12-27T14:00:00-05:00',
			'2027-01-31T14:00:00-05:00',
		]);
		const spilledInk = items.filter((item) => item.sourceUrl.endsWith('/spilled-ink-open-mic-poetry-reading'));
		assert.equal(spilledInk.length, 2);
	});

	it('keeps separate products at the same time as separate events', async () => {
		const items = await listing;
		const urls = new Set(items.filter((item) => toEasternIso(item.startsAt).startsWith('2026-11-25T19:00')).map((item) => item.sourceUrl));
		assert.equal(urls.size, 2);
	});

	it('skips products with no dated variant and says so', async () => {
		const items = await listing;
		assert.ok(!items.some((item) => item.sourceUrl.endsWith('/louder-all-female-fronted-rock-showcase')));
		assert.ok(notes.some((note) => note.includes('louder-all-female-fronted-rock-showcase')));
	});

	it('serves details from the listing without another request', async () => {
		const items = await listing;
		const item = items.find((entry) => entry.sourceUrl.endsWith('/inkwell-s-last-laugh-final-fridays-at-the-well'));
		assert.ok(item);
		const detail = await adapter.fetchDetail(item.sourceUrl, async () => assert.fail('should not fetch'));
		assert.ok(detail.imageUrl?.startsWith('https://cdn.shopify.com/'));
		assert.ok(detail.description);
	});

	it('refuses a full page of products', async () => {
		const full = JSON.stringify({
			products: Array.from({ length: 250 }, (_, index) => ({ title: 't', handle: `h${index}`, body_html: null, images: [], variants: [] })),
		});
		await assert.rejects(createInkwellAdapter(() => NOW).fetchListing(async () => full, () => {}), /pagination/);
	});
});
