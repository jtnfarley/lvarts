import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { canModifyPost } from './canModifyPost';

describe('canModifyPost', () => {
	it('lets the author delete their own post', () => {
		assert.equal(canModifyPost({ authorUserdetailsId: 5, userdetailsid: 5, isAdmin: false }), true);
	});

	it("does not let another user delete someone else's post", () => {
		assert.equal(canModifyPost({ authorUserdetailsId: 5, userdetailsid: 6, isAdmin: false }), false);
	});

	it('lets an admin delete any post', () => {
		assert.equal(canModifyPost({ authorUserdetailsId: 5, userdetailsid: 6, isAdmin: true }), true);
	});

	it('denies a logged-out caller', () => {
		assert.equal(canModifyPost({ authorUserdetailsId: 5, userdetailsid: undefined, isAdmin: false }), false);
	});

	it('does not treat two missing ids as a match', () => {
		assert.equal(canModifyPost({ authorUserdetailsId: undefined, userdetailsid: undefined, isAdmin: false }), false);
	});

	it('denies a logged-in user when the post has no author row', () => {
		assert.equal(canModifyPost({ authorUserdetailsId: undefined, userdetailsid: 6, isAdmin: false }), false);
	});
});
