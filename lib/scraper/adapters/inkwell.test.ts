import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { toEasternIso } from '../eastern';
import { cleanTitle } from '../titles';
import { createInkwellAdapter, normalizeTitle, parseDescriptionStarts, parseVariantStart } from './inkwell';

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

describe('parseDescriptionStarts', () => {
	const starts = (text: string): string[] => parseDescriptionStarts(text, NOW).starts.map((parsed) => toEasternIso(parsed.startsAt));

	it('prefers the show time over doors', () => {
		assert.deepEqual(starts('Friday, November 13, 2026 | Doors: 6:30 PM | Music: 7 PM | Advance: $15'), ['2026-11-13T19:00:00-05:00']);
		assert.deepEqual(starts('Friday, November 20, 2026 • Show at 8 PM'), ['2026-11-20T20:00:00-05:00']);
	});

	it('falls back to doors when it is the only time', () => {
		assert.deepEqual(starts('Saturday, November 28, 2026 | Doors: 6:30 PM'), ['2026-11-28T18:30:00-05:00']);
	});

	it('finds the time on a later line when the first mention has none, and assumes the year', () => {
		const text = 'Join us Sunday, November 22, for a morning of movement. SUNDAY, NOVEMBER 22 Workout: 8:15 AM Community 5K: 9 AM';
		const parsed = parseDescriptionStarts(text, NOW);
		assert.deepEqual(parsed.starts.map((entry) => toEasternIso(entry.startsAt)), ['2026-11-22T08:15:00-05:00']);
		assert.equal(parsed.starts[0].yearAssumed, true);
	});

	it('ignores dates without a weekday, ranges and deadlines', () => {
		assert.deepEqual(starts('On November 13 at 7 PM. Returns February 19-21, 2027. Submissions open through November 30, 2026.'), []);
	});

	it('rejects a weekday that does not match the date', () => {
		const parsed = parseDescriptionStarts('Tuesday, November 25 at 7 PM', NOW);
		assert.deepEqual(parsed.starts, []);
		assert.deepEqual(parsed.mismatches, ['Tuesday, November 25']);
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
		const product = (handle: string) => ({
			title: handle,
			handle,
			body_html: null,
			images: [],
			variants: [{ title: 'November 25, 2026 07:00 PM / General Admission' }],
		});
		const same = JSON.stringify({ products: [product('one'), product('two')] });
		const items = await createInkwellAdapter(() => NOW).fetchListing(async () => same, () => {});
		assert.equal(new Set(items.map((item) => item.sourceUrl)).size, 2);
	});

	it('uses the description date when no variant has one', async () => {
		const items = await listing;
		const startOf = (handle: string) => items.filter((item) => item.sourceUrl.endsWith(`/${handle}`)).map((item) => toEasternIso(item.startsAt));
		assert.deepEqual(startOf('friday-the-13th-live-at-inkwell'), ['2026-11-13T19:00:00-05:00']);
		assert.deepEqual(startOf('albert-davis-friends-live-at-inkwell'), ['2026-11-20T20:00:00-05:00']);
		assert.deepEqual(startOf('louder-all-female-fronted-rock-showcase'), ['2026-11-28T19:00:00-05:00']);
		assert.deepEqual(startOf('inkwell-s-2nd-annual-fit-friendsgiving'), ['2026-11-22T08:15:00-05:00']);
	});

	it('trusts the description over a lone variant date that disagrees with it', async () => {
		const items = await listing;
		const zumba = items.filter((item) => item.sourceUrl.endsWith('/inkwell-ness-presents-zumba-masterclass-miami-heat-edition'));
		assert.deepEqual(zumba.map((item) => toEasternIso(item.startsAt)), ['2026-11-24T19:00:00-05:00']);
		assert.ok(notes.some((note) => note.includes('zumba') && note.includes('disagrees')));
	});

	it('keeps variant dates when a series mentions only one of them in the description', async () => {
		const items = await listing;
		assert.equal(items.filter((item) => item.sourceUrl.endsWith('/brew-ha-ha-comedy-over-coffee-4')).length, 3);
	});

	it('skips recurring series and sign-up pages and says so', async () => {
		const items = await listing;
		for (const handle of ['the-creative-collective-a-mixed-media-open-mic-1', 'dopamine-caffeine-mellow-dj-sets-over-coffee', 'inkwell-run-club-5k-sunday', 'allentown-comedy-festival-comedian-submissions']) {
			assert.ok(!items.some((item) => item.sourceUrl.endsWith(`/${handle}`)), handle);
			assert.ok(notes.some((note) => note.includes(handle) && note.includes('skipped')), handle);
		}
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
