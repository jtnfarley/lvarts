import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { cleanTitle } from './titles';

describe('cleanTitle', () => {
	it('flags sold out with waitlist and splits at the en dash', () => {
		const result = cleanTitle(
			'• SOLD OUT! WAITLIST OPEN• Alex Radus Quartet, with Special Guest Joe Cirotti –Genre Whiplash, Inventive Songwriting',
		);
		assert.equal(result.headline, 'Alex Radus Quartet, with Special Guest Joe Cirotti');
		assert.equal(result.tagline, 'Genre Whiplash, Inventive Songwriting');
		assert.equal(result.soldOut, true);
		assert.equal(result.canceled, false);
		assert.deepEqual(result.notices, ['SOLD OUT! WAITLIST OPEN']);
	});

	it('strips a low ticket alert into notices without marking sold out', () => {
		const result = cleanTitle("• LOW TICKET ALERT! • Bill Kirchen's Honky Tonk Holiday – A Sleigh-full of Songs");
		assert.equal(result.headline, "Bill Kirchen's Honky Tonk Holiday");
		assert.equal(result.tagline, 'A Sleigh-full of Songs');
		assert.equal(result.soldOut, false);
		assert.deepEqual(result.notices, ['LOW TICKET ALERT!']);
	});

	it('marks a title that is only a canceled notice and keeps its text', () => {
		const result = cleanTitle('• DEC. 6 Open Mike Night IS CANCELED DUE TO A SEPARATE EVENT. Thank You!');
		assert.equal(result.canceled, true);
		assert.equal(result.headline, 'DEC. 6 Open Mike Night IS CANCELED DUE TO A SEPARATE EVENT. Thank You!');
		assert.equal(result.tagline, null);
	});

	it('detects the British spelling CANCELLED', () => {
		assert.equal(cleanTitle('• CANCELLED • Some Show – Tagline').canceled, true);
	});

	it('keeps everything after the dash as the tagline', () => {
		const result = cleanTitle('Frank Viele – New England Blues Rock with Folk | with guest, Arielle Silver');
		assert.equal(result.headline, 'Frank Viele');
		assert.equal(result.tagline, 'New England Blues Rock with Folk | with guest, Arielle Silver');
	});

	it('uses the whole title as the headline when there is no dash', () => {
		const result = cleanTitle('UnBound Year-Round: Fall Story Cabaret!');
		assert.equal(result.headline, 'UnBound Year-Round: Fall Story Cabaret!');
		assert.equal(result.tagline, null);
	});

	it('splits at a spaced hyphen but not at a hyphen inside a word', () => {
		assert.equal(cleanTitle('Blue Grass - Live').headline, 'Blue Grass');
		assert.equal(cleanTitle('Year-Round Show').headline, 'Year-Round Show');
	});

	it('collapses whitespace and keeps a multi-part notice', () => {
		const result = cleanTitle('•  SOLD OUT!   MATINEE   ADDED •   The   Band – Tag');
		assert.equal(result.headline, 'The Band');
		assert.deepEqual(result.notices, ['SOLD OUT! MATINEE ADDED']);
		assert.equal(result.soldOut, true);
	});
});
