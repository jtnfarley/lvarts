import type { GetHtml } from './types';

export const USER_AGENT = 'lvartandmusicBot/1.0 (+https://lvartandmusic.com; calendar@lvartandmusic.com)';
const BOT_NAME = 'lvartandmusicbot';

export const MIN_DELAY_MS = 1500;
export const TIMEOUT_MS = 15000;

export class RobotsDisallowedError extends Error {}

type RobotsRule = { allow: boolean; path: string };

// Rules from the group naming our bot, or else the `*` group.
export const parseRobots = (text: string): RobotsRule[] => {
	const groups = new Map<string, RobotsRule[]>();
	let agents: string[] = [];
	let lastWasAgent = false;

	for (const line of text.split(/\r?\n/)) {
		const [field, ...rest] = line.split('#')[0].split(':');
		const name = field.trim().toLowerCase();
		const value = rest.join(':').trim();

		if (name === 'user-agent') {
			if (!lastWasAgent) agents = [];
			agents.push(value.toLowerCase());
			lastWasAgent = true;
			continue;
		}
		lastWasAgent = false;
		if ((name !== 'allow' && name !== 'disallow') || !value) continue;
		for (const agent of agents) {
			groups.set(agent, [...(groups.get(agent) ?? []), { allow: name === 'allow', path: value }]);
		}
	}
	return groups.get(BOT_NAME) ?? groups.get('*') ?? [];
};

// Longest matching rule wins; allow wins ties.
export const isPathAllowed = (rules: RobotsRule[], path: string): boolean => {
	let best: RobotsRule | undefined;
	for (const rule of rules) {
		if (!path.startsWith(rule.path)) continue;
		if (!best || rule.path.length > best.path.length || (rule.path.length === best.path.length && rule.allow)) {
			best = rule;
		}
	}
	return best?.allow ?? true;
};

export type PoliteFetcherOptions = {
	fetchImpl?: typeof fetch;
	sleep?: (ms: number) => Promise<void>;
	now?: () => number;
	delayMs?: number;
};

export type BinaryResponse = { data: Uint8Array<ArrayBuffer>; contentType: string };

export type PoliteFetcher = {
	getHtml: GetHtml;
	getBinary: (url: string) => Promise<BinaryResponse>;
	stats: { requests: number; failedRequests: number };
	errors: string[];
};

// One fetcher per source: requests are sequential, spaced apart, and checked against robots.txt.
export const createPoliteFetcher = ({
	fetchImpl = fetch,
	sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
	now = Date.now,
	delayMs = MIN_DELAY_MS,
}: PoliteFetcherOptions = {}): PoliteFetcher => {
	const stats = { requests: 0, failedRequests: 0 };
	const errors: string[] = [];
	const robotsByOrigin = new Map<string, RobotsRule[]>();
	let lastRequestAt: number | undefined;

	const fetchOnce = async <T>(url: string, read: (response: Response) => Promise<T>): Promise<T> => {
		if (lastRequestAt !== undefined) {
			const wait = lastRequestAt + delayMs - now();
			if (wait > 0) await sleep(wait);
		}
		lastRequestAt = now();

		const response = await fetchImpl(url, {
			headers: { 'User-Agent': USER_AGENT },
			signal: AbortSignal.timeout(TIMEOUT_MS),
		});
		if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
		return read(response);
	};

	const fetchWithRetry = async <T>(url: string, read: (response: Response) => Promise<T>): Promise<T> => {
		stats.requests += 1;
		try {
			return await fetchOnce(url, read);
		} catch {
			// One retry; the delay in fetchOnce spaces it from the failed attempt.
			try {
				return await fetchOnce(url, read);
			} catch (error) {
				stats.failedRequests += 1;
				throw error;
			}
		}
	};

	const loadRobots = async (origin: string): Promise<RobotsRule[]> => {
		const cached = robotsByOrigin.get(origin);
		if (cached) return cached;

		let rules: RobotsRule[] = [];
		try {
			rules = parseRobots(await fetchWithRetry(`${origin}/robots.txt`, (response) => response.text()));
		} catch (error) {
			// A missing robots.txt means everything is allowed; other failures are logged and the run continues.
			errors.push(`robots.txt unavailable for ${origin}: ${error instanceof Error ? error.message : String(error)}`);
		}
		robotsByOrigin.set(origin, rules);
		return rules;
	};

	const fetchAllowed = async <T>(url: string, read: (response: Response) => Promise<T>): Promise<T> => {
		const { origin, pathname } = new URL(url);
		if (!isPathAllowed(await loadRobots(origin), pathname)) {
			const message = `robots.txt disallows ${url}`;
			errors.push(message);
			throw new RobotsDisallowedError(message);
		}
		return fetchWithRetry(url, read);
	};

	const getHtml: GetHtml = (url) => fetchAllowed(url, (response) => response.text());

	const getBinary = (url: string): Promise<BinaryResponse> =>
		fetchAllowed(url, async (response) => ({
			data: new Uint8Array(await response.arrayBuffer()),
			contentType: response.headers.get('content-type') ?? '',
		}));

	return { getHtml, getBinary, stats, errors };
};
