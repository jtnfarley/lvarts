import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { fullAddress, pickExistingVenue } from './venueRecords';

describe('fullAddress', () => {
	it('appends city and state to the street', () => {
		assert.equal(fullAddress({ address: '70 S Main St', city: 'New Hope', state: 'PA' }), '70 S Main St, New Hope, PA');
	});

	it('leaves the address empty when there is no street', () => {
		assert.equal(fullAddress({ city: 'New Hope', state: 'PA' }), undefined);
		assert.equal(fullAddress({ address: '  ', city: 'New Hope', state: 'PA' }), undefined);
	});
});

describe('pickExistingVenue', () => {
	const easton = { id: 1, city: 'Easton' };
	const allentown = { id: 2, city: 'Allentown' };
	const noCity = { id: 3, city: null };

	it('picks the same-named venue in the same city, ignoring case', () => {
		assert.equal(pickExistingVenue([allentown, easton], 'easton')?.id, 1);
	});

	it('falls back to a venue with no city yet', () => {
		assert.equal(pickExistingVenue([allentown, noCity], 'Easton')?.id, 3);
	});

	it('never reuses a venue in a different city', () => {
		assert.equal(pickExistingVenue([allentown], 'Easton'), undefined);
		assert.equal(pickExistingVenue([], 'Easton'), undefined);
	});
});
