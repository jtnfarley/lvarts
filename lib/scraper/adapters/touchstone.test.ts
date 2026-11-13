import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { easternWallTimeToDate, toEasternIso } from '../eastern';
import { createTouchstoneAdapter, eventLinks, parseEventPage, parseVenue } from './touchstone';

const fixtureDir = path.join(__dirname, '..', '__fixtures__');
const readFixture = (name: string): string => readFileSync(path.join(fixtureDir, `touchstone-${name}.html`), 'utf8');

// Fixtures were saved in November 2026, before the season's year-less dates.
const NOW = new Date('2026-11-13T12:00:00Z');
const startsOf = (slug: string): string[] =>
	parseEventPage(readFixture(slug), NOW).showtimes.map(({ year, month, day, hour, minute }) =>
		toEasternIso(easternWallTimeToDate(year, month, day, hour, minute)),
	);

describe('eventLinks', () => {
	it('collects each event page once and ignores ticket links', () => {
		const links = eventLinks(readFixture('season'));
		assert.equal(links.length, 16);
		assert.ok(links.includes('https://touchstone.org/events/the-poisoner/'));
		assert.ok(links.includes('https://touchstone.org/events/irts-story-gathering/'));
		assert.ok(links.every((link) => link.startsWith('https://touchstone.org/events/')));
	});
});

describe('parseEventPage', () => {
	it('expands a date range into one showtime per day', () => {
		assert.deepEqual(startsOf('the-poisoner'), ['2026-09-17T20:00:00-04:00', '2026-09-18T20:00:00-04:00', '2026-09-19T20:00:00-04:00']);
	});

	it('applies a weekday pattern to the date range in the first line', () => {
		assert.deepEqual(startsOf('milkdrunk'), ['2026-10-07T20:00:00-04:00', '2026-10-08T20:00:00-04:00', '2026-10-09T20:00:00-04:00', '2026-10-10T14:00:00-04:00']);
	});

	it('adds the extra shows listed under a weekday pattern', () => {
		const starts = startsOf('christmas-city-follies');
		assert.equal(starts.length, 13);
		assert.equal(starts[0], '2026-12-03T20:00:00-05:00');
		assert.ok(starts.includes('2026-12-16T20:00:00-05:00'), 'extra Wednesday show');
		assert.ok(starts.includes('2026-12-20T14:00:00-05:00'), 'Sunday matinee');
		assert.ok(!starts.includes('2026-12-14T20:00:00-05:00'), 'Monday is not a show day');
		// Saturday Dec 12 has an 8pm pattern show and an extra 2pm show; the day keeps the earlier one.
		assert.ok(starts.includes('2026-12-12T14:00:00-05:00'));
	});

	it('takes the earliest time when a day has two shows, and infers the year from the weekday', () => {
		assert.deepEqual(startsOf('still-here'), ['2026-10-03T14:00:00-04:00']);
	});

	it('reads a pair of dates', () => {
		assert.deepEqual(startsOf('5'), ['2026-09-25T19:00:00-04:00', '2026-09-26T19:00:00-04:00']);
	});

	it('reads the title, image, and description from the page', () => {
		const { title, detail } = parseEventPage(readFixture('the-poisoner'), NOW);
		assert.equal(title, 'UnBound Year-Round: The Poisoner');
		assert.ok(detail.imageUrl?.endsWith('Poisoner-Poster-with-billing.png'));
		assert.ok(detail.description?.startsWith('Presented in partnership'));
	});

	it('reads the venue from the ticket info, or from the venue note when the schedule is elsewhere', () => {
		assert.equal(parseEventPage(readFixture('the-poisoner'), NOW).detail.venue?.name, 'Touchstone Theatre');
		assert.equal(parseEventPage(readFixture('christmas-city-follies'), NOW).detail.venue?.name, 'Touchstone Theatre');
		assert.deepEqual(parseEventPage(readFixture('young-playwrights-festival'), NOW).detail.venue, {
			name: 'Northeast Middle School Theatre',
			address: '1170 Fernwood St',
			city: 'Bethlehem',
			state: 'PA',
			zip: '18018',
		});
	});

	it('leaves the venue empty when the page only gives a Spanish translation of the date', () => {
		assert.equal(parseEventPage(readFixture('5'), NOW).detail.venue, null);
	});

	it('rejects pages with no showtime', () => {
		assert.throws(() => parseEventPage(readFixture('fresh-voices'), NOW), /no showtime/);
		assert.throws(() => parseEventPage(readFixture('irts-launch-party'), NOW), /no showtime/);
	});
});

describe('parseVenue', () => {
	it('ignores the notes that follow a venue', () => {
		assert.equal(parseVenue(['Godfrey Daniels', 'Featuring: Dave Fry', 'Theme: "Light"'])?.name, 'Godfrey Daniels');
		assert.equal(parseVenue(['Theme: "Light"']), null);
	});

	it('skips a Spanish date line before the venue', () => {
		assert.equal(parseVenue(['Sábado 1 de mayo a las 15 h', "Touchstone Theatre's Barrio Stage"])?.name, "Touchstone Theatre's Barrio Stage");
		assert.equal(parseVenue(['Viernes 25 y Sábado 26 de Septiembre a las 7pm']), null);
	});
});

describe('touchstone adapter', () => {
	const pages = new Map([
		['https://touchstone.org/season/', readFixture('season')],
		['https://touchstone.org/events/the-poisoner/', readFixture('the-poisoner')],
		['https://touchstone.org/events/fresh-voices/', readFixture('fresh-voices')],
	]);
	const getHtml = async (url: string): Promise<string> => {
		const html = pages.get(url);
		if (!html) throw new Error(`HTTP 404 for ${url}`);
		return html;
	};

	it('lists one item per day, skips pages it cannot read, and serves details without more requests', async () => {
		const reports: string[] = [];
		const adapter = createTouchstoneAdapter(() => NOW);
		const items = await adapter.fetchListing(getHtml, (message) => reports.push(message));

		assert.equal(items.length, 3);
		assert.equal(toEasternIso(items[0].startsAt), '2026-09-17T20:00:00-04:00');
		assert.ok(reports.some((message) => message.includes('fresh-voices') && message.includes('no showtime')));
		assert.ok(reports.some((message) => message.includes('irts-launch-party') && message.includes('404')));

		const detail = await adapter.fetchDetail(items[0].sourceUrl, async () => {
			throw new Error('fetchDetail must not make requests');
		});
		assert.equal(detail.venue?.name, 'Touchstone Theatre');
	});
});
