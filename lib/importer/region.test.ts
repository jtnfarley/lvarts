import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isLehighValleyCity } from './region';

describe('isLehighValleyCity', () => {
	it('recognizes Lehigh Valley towns regardless of case and spacing', () => {
		assert.equal(isLehighValleyCity('Easton'), true);
		assert.equal(isLehighValleyCity('  fountain   HILL '), true);
	});

	it('does not count towns outside the valley', () => {
		assert.equal(isLehighValleyCity('Philadelphia'), false);
		assert.equal(isLehighValleyCity('New Hope'), false);
	});
});
