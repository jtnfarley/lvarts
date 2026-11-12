import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { ScrapedEvent } from '../scraper/types';
import { buildPostContent, extractSourceUrl, hasSoldOutLine } from './postContent';

const event = (overrides: Partial<ScrapedEvent> = {}): ScrapedEvent => ({
	sourceKey: 'test',
	sourceUrl: 'https://venue.test/event/a/',
	matchKey: 'https://venue.test/event/a/#2026-12-01',
	startsAt: '2026-12-01T20:00:00-05:00',
	rawTitle: 'A',
	headline: 'A',
	tagline: 'Folk & Roots',
	soldOut: false,
	canceled: false,
	notices: [],
	description: 'A short description.',
	imageUrl: null,
	venue: null,
	detailFetchedAt: '2026-11-07T10:00:00.000Z',
	warnings: [],
	...overrides,
});

const lexicalParagraphs = (lexical: string): { children: { type: string; text: string; url?: string }[] }[] =>
	JSON.parse(lexical).root.children;

describe('buildPostContent', () => {
	it('orders tagline, description, sold out and the source link line', () => {
		const { content } = buildPostContent(event({ soldOut: true }));
		const order = ['Folk &amp; Roots', 'A short description.', '>Sold out<', 'More info and tickets:'].map((text) =>
			content.indexOf(text),
		);
		assert.ok(order.every((index) => index >= 0));
		assert.deepEqual(order, [...order].sort((a, b) => a - b));
	});

	it('ends with the exact source link line in both formats', () => {
		const { content, lexical } = buildPostContent(event());
		assert.ok(content.endsWith('</a></p>'));
		assert.match(content, /More info and tickets: <\/span><a href="https:\/\/venue\.test\/event\/a\/"/);

		const last = lexicalParagraphs(lexical).at(-1)!;
		assert.equal(last.children[0].text, 'More info and tickets: ');
		assert.equal(last.children[1].type, 'autolink');
		assert.equal(last.children[1].url, 'https://venue.test/event/a/');
	});

	it('leaves out missing parts and the sold out line when not sold out', () => {
		const { content, lexical } = buildPostContent(event({ tagline: null, description: null }));
		assert.ok(!content.includes('Sold out'));
		assert.equal(lexicalParagraphs(lexical).length, 1);
	});

	it('escapes HTML and square brackets from scraped text', () => {
		const { content } = buildPostContent(event({ tagline: '<b>Hi</b> [tag]' }));
		assert.ok(!content.includes('<b>'));
		assert.ok(!content.includes('[tag]'));
		assert.ok(content.includes('(tag)'));
	});
});

describe('extractSourceUrl', () => {
	it('round-trips the url, including characters that need escaping', () => {
		const url = 'https://venue.test/event/a/?x=1&y=2';
		assert.equal(extractSourceUrl(buildPostContent(event({ sourceUrl: url })).content), url);
	});

	it('finds the url in plain text and returns null for other posts', () => {
		assert.equal(extractSourceUrl('<p>More info and tickets: https://venue.test/e/</p>'), 'https://venue.test/e/');
		assert.equal(extractSourceUrl('<p>Just a normal post</p>'), null);
		assert.equal(extractSourceUrl(null), null);
	});
});

describe('hasSoldOutLine', () => {
	it('detects the sold out line only in content that has it', () => {
		assert.equal(hasSoldOutLine(buildPostContent(event({ soldOut: true })).content), true);
		assert.equal(hasSoldOutLine(buildPostContent(event()).content), false);
	});
});
