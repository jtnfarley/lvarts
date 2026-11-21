import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import { isCronRequest } from './isCronRequest';

const requestWith = (authorization?: string) =>
	new Request('https://example.test/api/cron', { headers: authorization ? { authorization } : {} });

describe('isCronRequest', () => {
	const original = process.env.CRON_SECRET;
	afterEach(() => {
		if (original === undefined) delete process.env.CRON_SECRET;
		else process.env.CRON_SECRET = original;
	});

	it('accepts the exact bearer secret', () => {
		process.env.CRON_SECRET = 's3cret';
		assert.equal(isCronRequest(requestWith('Bearer s3cret')), true);
	});

	it('rejects a wrong, partial or missing header', () => {
		process.env.CRON_SECRET = 's3cret';
		assert.equal(isCronRequest(requestWith('Bearer s3cre')), false);
		assert.equal(isCronRequest(requestWith('s3cret')), false);
		assert.equal(isCronRequest(requestWith()), false);
	});

	it('rejects everything when no secret is configured', () => {
		delete process.env.CRON_SECRET;
		assert.equal(isCronRequest(requestWith('Bearer ')), false);
		assert.equal(isCronRequest(requestWith()), false);
	});
});
