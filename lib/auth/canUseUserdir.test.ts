import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { canUseUserdir } from './canUseUserdir';

const base = { userdir: 'ABC123DEF4', ownUserdir: 'ABC123DEF4', isAdmin: false, ownedByAnotherUser: false };

describe('canUseUserdir', () => {
	it('allows a user to use their own folder', () => {
		assert.equal(canUseUserdir(base), true);
	});

	it("does not allow another user's folder", () => {
		assert.equal(canUseUserdir({ ...base, userdir: 'VICTIM12345', ownedByAnotherUser: true }), false);
	});

	it("does not allow another user's folder even if the ownership lookup said it was free", () => {
		assert.equal(canUseUserdir({ ...base, userdir: 'VICTIM12345', ownedByAnotherUser: false }), false);
	});

	it('lets a user with no folder yet start a new unclaimed one', () => {
		assert.equal(canUseUserdir({ ...base, ownUserdir: null, userdir: 'NEWFOLDER01' }), true);
		assert.equal(canUseUserdir({ ...base, ownUserdir: undefined, userdir: 'NEWFOLDER01' }), true);
	});

	it('does not let a user with no folder claim one that is already owned', () => {
		assert.equal(canUseUserdir({ ...base, ownUserdir: null, userdir: 'VICTIM12345', ownedByAnotherUser: true }), false);
	});

	it('lets an admin use any folder', () => {
		assert.equal(canUseUserdir({ ...base, userdir: 'VICTIM12345', isAdmin: true, ownedByAnotherUser: true }), true);
	});

	it('rejects unsafe names for everyone, including admins', () => {
		for (const userdir of ['', '..', '../other', 'a/b', 'a\\b', 'with space', 'dots.in.name']) {
			assert.equal(canUseUserdir({ ...base, userdir, ownUserdir: userdir, isAdmin: false }), false, userdir);
			assert.equal(canUseUserdir({ ...base, userdir, isAdmin: true }), false, `admin ${userdir}`);
		}
	});
});
