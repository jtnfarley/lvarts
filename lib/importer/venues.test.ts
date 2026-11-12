import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { ScrapedEvent, ScrapedVenue } from '../scraper/types';
import { resolveVenueId, venueLookupKey, type VenueLookup } from './venues';

const event = (headline: string, venue: ScrapedVenue | null): ScrapedEvent => ({
	sourceKey: 'band',
	sourceUrl: 'https://band.test/event/a',
	matchKey: 'https://band.test/event/a#2026-12-01',
	startsAt: '2026-12-01T20:00:00-05:00',
	rawTitle: headline,
	headline,
	tagline: null,
	soldOut: false,
	canceled: false,
	notices: [],
	description: null,
	imageUrl: null,
	venue,
	detailFetchedAt: '2026-11-01T10:00:00Z',
	warnings: [],
});

const lookup = (overrides: Partial<VenueLookup> = {}): VenueLookup => ({
	mappings: new Map(),
	venues: [
		{ id: 1, name: 'Lafayette Bar', city: 'Easton' },
		{ id: 2, name: 'The Pub', city: 'Allentown' },
		{ id: 3, name: 'The Pub', city: 'Bethlehem' },
	],
	...overrides,
});

describe('venueLookupKey', () => {
	it('uses the venue name when there is one, and the title when there is not', () => {
		assert.equal(venueLookupKey(event('Show', { name: '  Lafayette   BAR ' })), 'lafayette bar');
		assert.equal(venueLookupKey(event('High Tea  At Deck', null)), 'high tea at deck');
	});
});

describe('resolveVenueId', () => {
	it('matches a venue by exact name, ignoring case and spacing', () => {
		assert.equal(resolveVenueId(lookup(), event('Show', { name: 'lafayette  bar' })), 1);
	});

	it('does not guess at near matches or unknown venues', () => {
		assert.equal(resolveVenueId(lookup(), event('Show', { name: 'Lafayette' })), null);
		assert.equal(resolveVenueId(lookup(), event('Show', { name: 'Somewhere New' })), null);
	});

	it('never matches on the title alone', () => {
		assert.equal(resolveVenueId(lookup(), event('Lafayette Bar', null)), null);
	});

	it('uses the city to choose between venues that share a name, and gives up without one', () => {
		assert.equal(resolveVenueId(lookup(), event('Show', { name: 'The Pub', city: 'bethlehem' })), 3);
		assert.equal(resolveVenueId(lookup(), event('Show', { name: 'The Pub' })), null);
		assert.equal(resolveVenueId(lookup(), event('Show', { name: 'The Pub', city: 'Emmaus' })), null);
	});

	it("prefers an admin's saved answer over a name match", () => {
		const saved = lookup({ mappings: new Map([['lafayette bar', 3]]) });
		assert.equal(resolveVenueId(saved, event('Show', { name: 'Lafayette Bar' })), 3);
	});

	it('resolves a recurring title with no venue once an admin has answered for it', () => {
		const saved = lookup({ mappings: new Map([['high tea at deck', 2]]) });
		assert.equal(resolveVenueId(saved, event('High Tea at Deck', null)), 2);
		assert.equal(resolveVenueId(lookup(), event('High Tea at Deck', null)), null);
	});
});
