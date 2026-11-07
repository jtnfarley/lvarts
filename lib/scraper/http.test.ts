import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createPoliteFetcher, isPathAllowed, parseRobots, RobotsDisallowedError, USER_AGENT } from './http';

const ROBOTS = 'User-agent: *\nDisallow: /private/\nAllow: /private/ok\n';

// Fake network and clock: sleeping advances the clock, so spacing can be asserted without waiting.
const harness = (responses: Record<string, string | number>) => {
	const calls: { url: string; at: number; userAgent: string }[] = [];
	let clock = 0;
	const fetchImpl = (async (url: string, init?: RequestInit) => {
		calls.push({ url, at: clock, userAgent: new Headers(init?.headers).get('user-agent') ?? '' });
		const body = responses[url];
		if (typeof body === 'string') return new Response(body);
		return new Response('error', { status: body ?? 404 });
	}) as typeof fetch;
	const sleep = async (ms: number) => {
		clock += ms;
	};
	return { calls, fetcher: createPoliteFetcher({ fetchImpl, sleep, now: () => clock }) };
};

describe('robots rules', () => {
	it('applies the longest matching rule', () => {
		const rules = parseRobots(ROBOTS);
		assert.equal(isPathAllowed(rules, '/private/x'), false);
		assert.equal(isPathAllowed(rules, '/private/ok'), true);
		assert.equal(isPathAllowed(rules, '/event/x'), true);
	});

	it('prefers a group naming our bot over the wildcard group', () => {
		const rules = parseRobots('User-agent: *\nDisallow: /\n\nUser-agent: lvartandmusicBot\nDisallow: /nope\n');
		assert.equal(isPathAllowed(rules, '/event/x'), true);
		assert.equal(isPathAllowed(rules, '/nope'), false);
	});
});

describe('createPoliteFetcher', () => {
	it('sends the bot User-Agent and spaces requests at least 1.5 seconds apart', async () => {
		const { fetcher, calls } = harness({
			'https://v.test/robots.txt': ROBOTS,
			'https://v.test/a': 'A',
			'https://v.test/b': 'B',
		});
		assert.equal(await fetcher.getHtml('https://v.test/a'), 'A');
		await fetcher.getHtml('https://v.test/b');

		assert.deepEqual(
			calls.map((call) => call.url),
			['https://v.test/robots.txt', 'https://v.test/a', 'https://v.test/b'],
		);
		assert.ok(calls.every((call) => call.userAgent === USER_AGENT));
		for (let i = 1; i < calls.length; i += 1) assert.ok(calls[i].at - calls[i - 1].at >= 1500);
	});

	it('refuses paths disallowed by robots.txt without requesting them', async () => {
		const { fetcher, calls } = harness({ 'https://v.test/robots.txt': ROBOTS, 'https://v.test/private/x': 'secret' });
		await assert.rejects(fetcher.getHtml('https://v.test/private/x'), RobotsDisallowedError);
		assert.ok(!calls.some((call) => call.url.endsWith('/private/x')));
		assert.ok(fetcher.errors.some((message) => message.includes('disallows')));
	});

	it('retries once after a failure, then counts the request as failed', async () => {
		const { fetcher, calls } = harness({ 'https://v.test/robots.txt': ROBOTS, 'https://v.test/a': 500 });
		await assert.rejects(fetcher.getHtml('https://v.test/a'));
		assert.equal(calls.filter((call) => call.url.endsWith('/a')).length, 2);
		assert.equal(fetcher.stats.failedRequests, 1);
	});
});
