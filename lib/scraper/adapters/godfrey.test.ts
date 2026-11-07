import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { easternDate, toEasternIso } from '../eastern';
import { cleanTitle } from '../titles';
import { parseDateTime, parseDetail, parseListing, trimDescription } from './godfrey';

const fixture = (name: string): string => readFileSync(path.join(__dirname, '..', '__fixtures__', name), 'utf8');
const listing = parseListing(fixture('listing.html'));

const byTitle = (text: string) => {
	const item = listing.find((entry) => entry.rawTitle.includes(text));
	assert.ok(item, `no listing item containing "${text}"`);
	return item;
};

const eastern = (text: string): string => {
	const date = parseDateTime(text);
	assert.ok(date, `could not parse "${text}"`);
	return toEasternIso(date);
};

describe('parseDateTime', () => {
	it('parses an evening show in daylight time', () => {
		assert.equal(eastern('Friday Oct 30th, 2026 @ 08:00 PM'), '2026-10-30T20:00:00-04:00');
	});

	it('uses standard time after the DST change on Nov 1, 2026', () => {
		assert.equal(eastern('Friday Nov 6th, 2026 @ 08:00 PM'), '2026-11-06T20:00:00-05:00');
		assert.equal(eastern('Sunday Nov 1st, 2026 @ 07:00 PM'), '2026-11-01T19:00:00-05:00');
		assert.equal(eastern('Sunday Nov 1st, 2026 @ 12:30 AM'), '2026-11-01T00:30:00-04:00');
	});

	it('parses a matinee', () => {
		assert.equal(eastern('Sunday Nov 15th, 2026 @ 03:00 PM'), '2026-11-15T15:00:00-05:00');
	});

	it('handles noon, midnight and ordinal suffixes', () => {
		assert.equal(eastern('Monday Dec 2nd, 2026 @ 12:00 PM'), '2026-12-02T12:00:00-05:00');
		assert.equal(eastern('Thursday Dec 3rd, 2026 @ 12:00 AM'), '2026-12-03T00:00:00-05:00');
	});

	it('returns null when there is no date', () => {
		assert.equal(parseDateTime('Array'), null);
	});
});

describe('parseListing', () => {
	it('captures every event on the fixture page', () => {
		assert.equal(listing.length, 30);
	});

	it('parses a normal show', () => {
		const item = byTitle('Frank Viele');
		assert.equal(item.sourceUrl, 'https://godfreydaniels.org/event/frank-viele-november-6-2026/');
		assert.equal(toEasternIso(item.startsAt), '2026-11-06T20:00:00-05:00');
		assert.equal(cleanTitle(item.rawTitle).headline, 'Frank Viele');
	});

	it('parses a sold-out show', () => {
		const cleaned = cleanTitle(byTitle('Alex Radus').rawTitle);
		assert.equal(cleaned.soldOut, true);
		assert.equal(cleaned.headline, 'Alex Radus Quartet, with Special Guest Joe Cirotti');
	});

	it('parses a low-ticket-alert show', () => {
		const cleaned = cleanTitle(byTitle('LOW TICKET ALERT').rawTitle);
		assert.equal(cleaned.soldOut, false);
		assert.deepEqual(cleaned.notices, ['LOW TICKET ALERT!']);
		assert.equal(cleaned.headline, 'Bill Kirchen’s Honky Tonk Holiday');
	});

	it('parses a canceled event and keeps it', () => {
		const item = byTitle('CANCELED');
		assert.equal(cleanTitle(item.rawTitle).canceled, true);
		assert.equal(toEasternIso(item.startsAt), '2026-12-06T19:00:00-05:00');
	});

	it('parses a matinee', () => {
		assert.equal(toEasternIso(byTitle('Seth Walker').startsAt), '2026-11-15T15:00:00-05:00');
	});

	it('does not leak the template text or ticket label into titles', () => {
		for (const item of listing) {
			assert.ok(!/^Array/.test(item.rawTitle) && !/Paid$/.test(item.rawTitle), item.rawTitle);
		}
	});

	it('keeps two open mike nights that share a URL as two events', () => {
		const html = `
			<a href="/event/open-mike/"><div>Array</div><span class="date">Sunday Dec 6th, 2026 @ 07:00 PM</span><span class="heading2">Open Mike Night</span></a>
			<a href="/event/open-mike/"><div>Array</div><span class="date">Sunday Jan 3rd, 2027 @ 07:00 PM</span><span class="heading2">Open Mike Night</span></a>`;
		const items = parseListing(html);
		assert.equal(items.length, 2);
		assert.equal(items[0].sourceUrl, items[1].sourceUrl);
		assert.notEqual(easternDate(items[0].startsAt), easternDate(items[1].startsAt));
	});
});

describe('parseDetail', () => {
	it('reads the og:image, description and time of a sold-out show', () => {
		const detail = parseDetail(fixture('detail-alex-radus-quartet-with-joe-cirotti-november-7-2026.html'));
		assert.equal(detail.imageUrl, 'https://godfreydaniels.org/app/uploads/2026/10/7NOV2026_RADUS-CIROTTI-7.png');
		assert.match(detail.description ?? '', /^Expect the unexpected when Alex Radus/);
		assert.ok((detail.description ?? '').length <= 400);
		assert.ok(detail.startsAt);
		assert.equal(toEasternIso(detail.startsAt), '2026-11-07T20:00:00-05:00');
	});

	it('reads a description that is a plain paragraph', () => {
		const detail = parseDetail(fixture('detail-bill-kirchen-honky-tonk-holiday-december-10-2026.html'));
		assert.match(detail.description ?? '', /^Forget the Nutcracker/);
	});

	it('returns no description for an expired listing and still finds the image', () => {
		const detail = parseDetail(fixture('detail-frank-viele-november-6-2026.html'));
		assert.equal(detail.description, null);
		assert.ok(detail.imageUrl);
	});

	it('takes only the first paragraph of the open mike page', () => {
		const detail = parseDetail(fixture('detail-open-mike-night-first-sunday.html'));
		assert.match(detail.description ?? '', /^Join us at Godfrey Daniels/);
		assert.ok(!(detail.description ?? '').includes('Scrabble'));
	});
});

describe('trimDescription', () => {
	it('leaves short text alone and cuts long text at a sentence end', () => {
		assert.equal(trimDescription('Short one.'), 'Short one.');
		const long = `${'First sentence here. '.repeat(10)}${'word '.repeat(60)}`;
		const trimmed = trimDescription(long);
		assert.ok(trimmed.length <= 400);
		assert.ok(trimmed.endsWith('.'));
	});
});
