import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { InvalidRoundupInput, resolveWindow } from './roundupWindow';

const iso = (date: Date) => date.toISOString();

describe('today preset', () => {
	it('uses the Eastern date, not the UTC date, at 11:30 PM Eastern', () => {
		// 11:30 PM EDT on Thu Oct 22 is already Oct 23 in UTC.
		const window = resolveWindow({ preset: 'today' }, new Date('2026-10-23T03:30:00Z'));
		assert.equal(window.dateLabel, 'THU OCT 22');
		assert.equal(iso(window.startsAt), '2026-10-22T04:00:00.000Z');
		assert.equal(iso(window.endsAt), '2026-10-23T04:00:00.000Z');
		assert.equal(window.kind, 'daily');
		assert.equal(window.headline, "What's Happening Today");
	});

	it('accepts an explicit date', () => {
		const window = resolveWindow({ preset: 'today', date: '2026-10-23' });
		assert.equal(window.dateLabel, 'FRI OCT 23');
	});

	it('spans 25 hours on the day DST ends', () => {
		const window = resolveWindow({ preset: 'today', date: '2026-11-01' });
		assert.equal(window.endsAt.getTime() - window.startsAt.getTime(), 25 * 3600 * 1000);
	});
});

describe('weekend preset', () => {
	it('looks ahead from Wednesday', () => {
		const window = resolveWindow({ preset: 'weekend' }, new Date('2026-10-21T16:00:00Z'));
		assert.equal(window.dateLabel, 'OCT 23–25');
		assert.equal(iso(window.startsAt), '2026-10-23T04:00:00.000Z');
		assert.equal(iso(window.endsAt), '2026-10-26T04:00:00.000Z');
		assert.equal(window.headline, 'This Weekend in the Valley');
	});

	it('uses the current weekend on Saturday', () => {
		const window = resolveWindow({ preset: 'weekend' }, new Date('2026-10-24T16:00:00Z'));
		assert.equal(window.dateLabel, 'OCT 23–25');
	});

	it('uses the current weekend on Sunday night Eastern', () => {
		// 11:30 PM EDT Sunday Oct 25 is Monday in UTC.
		const window = resolveWindow({ preset: 'weekend' }, new Date('2026-10-26T03:30:00Z'));
		assert.equal(window.dateLabel, 'OCT 23–25');
	});

	it('uses the current weekend on Friday and the next one on Monday', () => {
		assert.equal(resolveWindow({ preset: 'weekend' }, new Date('2026-10-23T16:00:00Z')).dateLabel, 'OCT 23–25');
		assert.equal(resolveWindow({ preset: 'weekend' }, new Date('2026-10-26T16:00:00Z')).dateLabel, 'OCT 30–NOV 1');
	});

	it('handles the DST change inside a weekend', () => {
		const window = resolveWindow({ preset: 'weekend', date: '2026-10-28' });
		assert.equal(window.dateLabel, 'OCT 30–NOV 1');
		assert.equal(iso(window.endsAt), '2026-11-02T05:00:00.000Z');
	});
});

describe('custom range', () => {
	it('is inclusive of both dates with a generic headline', () => {
		const window = resolveWindow({ start: '2026-10-24', end: '2026-10-28' });
		assert.equal(window.kind, 'custom');
		assert.equal(window.dateLabel, 'OCT 24–28');
		assert.equal(iso(window.startsAt), '2026-10-24T04:00:00.000Z');
		assert.equal(iso(window.endsAt), '2026-10-29T04:00:00.000Z');
		assert.equal(window.headline, 'Coming Up in the Valley');
	});

	it('labels a single-day range as one date', () => {
		assert.equal(resolveWindow({ start: '2026-10-24', end: '2026-10-24' }).dateLabel, 'OCT 24');
	});
});

describe('invalid input', () => {
	it('rejects bad dates, reversed ranges and missing options', () => {
		assert.throws(() => resolveWindow({ preset: 'today', date: '2026-13-01' }), InvalidRoundupInput);
		assert.throws(() => resolveWindow({ preset: 'today', date: 'tomorrow' }), InvalidRoundupInput);
		assert.throws(() => resolveWindow({ start: '2026-10-28', end: '2026-10-24' }), InvalidRoundupInput);
		assert.throws(() => resolveWindow({ start: '2026-10-28' }), InvalidRoundupInput);
		assert.throws(() => resolveWindow({}), InvalidRoundupInput);
	});
});
