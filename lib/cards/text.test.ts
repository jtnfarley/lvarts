import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
	cleanText,
	easternWallTimeToDate,
	formatDateLine,
	stripEmoji,
	stripHtml,
	titleStyle,
	truncate,
} from './text';

describe('stripHtml', () => {
	it('removes tags, decodes entities and collapses whitespace', () => {
		assert.equal(stripHtml('<p>Live &amp; loud</p><p>  doors&nbsp;at 8 &#39;ish</p>'), "Live & loud doors at 8 'ish");
	});

	it('separates line breaks with a space', () => {
		assert.equal(stripHtml('one<br>two<br/>three'), 'one two three');
	});
});

describe('stripEmoji', () => {
	it('removes emoji and tidies spacing', () => {
		assert.equal(stripEmoji('Jazz 🎷 Night 🎉'), 'Jazz Night');
		assert.equal(cleanText('<p>Hi 👋🏽 there</p>'), 'Hi there');
	});
});

describe('truncate', () => {
	it('leaves short text alone', () => {
		assert.equal(truncate('short', 10), 'short');
	});

	it('cuts at a word boundary and adds an ellipsis', () => {
		assert.equal(truncate('the quick brown fox jumps', 20), 'the quick brown…');
	});

	it('hard cuts when there is no usable word boundary', () => {
		assert.equal(truncate('abcdefghijklmnopqrstuvwxyz', 10), 'abcdefghi…');
	});
});

describe('titleStyle', () => {
	it('picks the font size by length tier', () => {
		assert.equal(titleStyle('a'.repeat(30), true).fontSize, 72);
		assert.equal(titleStyle('a'.repeat(31), true).fontSize, 58);
		assert.equal(titleStyle('a'.repeat(61), true).fontSize, 48);
		assert.equal(titleStyle('a'.repeat(30), false).fontSize, 104);
		assert.equal(titleStyle('a'.repeat(60), false).fontSize, 84);
		assert.equal(titleStyle('a'.repeat(90), false).fontSize, 68);
	});

	it('truncates titles over 90 characters near 100', () => {
		const { text } = titleStyle('word '.repeat(30).trim(), true);
		assert.ok(text.length <= 100);
		assert.ok(text.endsWith('…'));
	});
});

describe('formatDateLine', () => {
	it('formats with time in Eastern', () => {
		assert.equal(formatDateLine(new Date('2026-10-25T00:00:00Z')), 'SAT OCT 24 · 8:00 PM');
	});

	it('shows date only when the time is exactly midnight Eastern', () => {
		assert.equal(formatDateLine(easternWallTimeToDate(2026, 10, 24)), 'SAT OCT 24');
	});

	it('uses the correct offset on both sides of the Nov 1 2026 DST change', () => {
		// 8 PM Eastern on Oct 31 is EDT (UTC-4); 8 PM on Nov 8 is EST (UTC-5).
		assert.equal(formatDateLine(new Date('2026-11-01T00:00:00Z')), 'SAT OCT 31 · 8:00 PM');
		assert.equal(formatDateLine(new Date('2026-11-09T01:00:00Z')), 'SUN NOV 8 · 8:00 PM');
		assert.equal(formatDateLine(new Date('2026-11-02T01:00:00Z')), 'SUN NOV 1 · 8:00 PM');
	});

	it('shows noon and midnight-hour times as 12', () => {
		assert.equal(formatDateLine(new Date('2026-10-24T16:00:00Z')), 'SAT OCT 24 · 12:00 PM');
		assert.equal(formatDateLine(new Date('2026-10-24T04:30:00Z')), 'SAT OCT 24 · 12:30 AM');
	});

	it('handles a missing date', () => {
		assert.equal(formatDateLine(null), 'DATE TBA');
	});
});

describe('easternWallTimeToDate', () => {
	it('is DST-aware', () => {
		assert.equal(easternWallTimeToDate(2026, 10, 31).toISOString(), '2026-10-31T04:00:00.000Z');
		assert.equal(easternWallTimeToDate(2026, 11, 8).toISOString(), '2026-11-08T05:00:00.000Z');
	});
});
