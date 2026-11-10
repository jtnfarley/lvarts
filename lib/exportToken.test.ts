import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createExportToken, verifyExportToken } from './exportToken';

const secret = 'test-secret';
const now = 1_700_000_000_000;

describe('export token', () => {
	it('accepts a fresh token and returns the user it was issued for', () => {
		const token = createExportToken(42, secret, now);
		assert.equal(verifyExportToken(token, secret, now + 1000), 42);
	});

	it('rejects an expired token', () => {
		const token = createExportToken(42, secret, now);
		assert.equal(verifyExportToken(token, secret, now + 2 * 60 * 60 * 1000), undefined);
	});

	it('rejects a token signed with another secret', () => {
		const token = createExportToken(42, 'other-secret', now);
		assert.equal(verifyExportToken(token, secret, now), undefined);
	});

	it('rejects a token whose user id was changed', () => {
		const [, expiresAt, signature] = createExportToken(42, secret, now).split('.');
		assert.equal(verifyExportToken(`43.${expiresAt}.${signature}`, secret, now), undefined);
	});

	it('rejects a token whose expiry was extended', () => {
		const [id, expiresAt, signature] = createExportToken(42, secret, now).split('.');
		assert.equal(verifyExportToken(`${id}.${Number(expiresAt) + 1}.${signature}`, secret, now), undefined);
	});

	it('rejects malformed tokens', () => {
		for (const token of ['', 'abc', '1.2', '1.2.3.4', 'x.y.z']) {
			assert.equal(verifyExportToken(token, secret, now), undefined);
		}
	});
});
