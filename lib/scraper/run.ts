import { diffSnapshots } from './diff';
import { easternDate, toEasternIso } from './eastern';
import { createPoliteFetcher, type PoliteFetcher } from './http';
import type { SnapshotStore } from './snapshots';
import { SOURCES, type Source } from './sources';
import { cleanTitle } from './titles';
import { SCHEMA_VERSION, type RunDiff, type ScrapedEvent, type Snapshot } from './types';

export const DETAIL_FETCH_CAP = 20;

const WARNING_TIMES_DIFFER = 'listing and detail times differ';
const WARNING_NO_IMAGE = 'no image';
const WARNING_NO_DESCRIPTION = 'no description';
const WARNING_DETAIL_FAILED = 'detail fetch failed';
const WARNING_DETAIL_PENDING = 'details not fetched yet';

export type SourceSummary = {
	sourceKey: string;
	eventsFound: number;
	newCount: number;
	changedCount: number;
	missingCount: number;
	detailsFetched: number;
	warningCount: number;
	errors: string[];
	failed: boolean;
	saved: boolean;
};

export type SourceResult = { summary: SourceSummary; snapshot: Snapshot; diff: RunDiff };

const errorMessage = (error: unknown): string => (error instanceof Error ? error.message : String(error));

const emptyDiff = (): RunDiff => ({ newEvents: [], changed: [], missingPast: [], missingFuture: [] });

// Builds the snapshot for one source. Throws only if the listing itself cannot be fetched.
export const scrapeSource = async (
	source: Source,
	previous: Snapshot | null,
	fetcher: PoliteFetcher,
	startedAt: Date,
): Promise<Snapshot> => {
	const listing = await source.adapter.fetchListing(fetcher.getHtml);
	const previousByKey = new Map((previous?.events ?? []).map((event) => [event.matchKey, event]));
	const errors: string[] = [];
	const events = new Map<string, ScrapedEvent>();
	let detailsFetched = 0;

	for (const item of listing) {
		const listingKey = `${item.sourceUrl}#${easternDate(item.startsAt)}`;
		const listingStartsAt = toEasternIso(item.startsAt);
		const earlier = previousByKey.get(listingKey);

		const event: ScrapedEvent = {
			sourceKey: source.key,
			sourceUrl: item.sourceUrl,
			matchKey: listingKey,
			startsAt: listingStartsAt,
			rawTitle: item.rawTitle,
			...cleanTitle(item.rawTitle),
			description: null,
			imageUrl: null,
			detailFetchedAt: null,
			warnings: [],
		};

		if (earlier?.detailFetchedAt && earlier.startsAt === listingStartsAt) {
			// Already seen with the same time: reuse its details without a request.
			event.description = earlier.description;
			event.imageUrl = earlier.imageUrl;
			event.detailFetchedAt = earlier.detailFetchedAt;
			event.warnings = earlier.warnings;
		} else if (detailsFetched < DETAIL_FETCH_CAP) {
			detailsFetched += 1;
			try {
				const detail = await source.adapter.fetchDetail(item.sourceUrl, fetcher.getHtml);
				event.description = detail.description;
				event.imageUrl = detail.imageUrl;
				event.detailFetchedAt = new Date().toISOString();
				if (!detail.imageUrl) event.warnings.push(WARNING_NO_IMAGE);
				if (!detail.description) event.warnings.push(WARNING_NO_DESCRIPTION);
				if (detail.startsAt && detail.startsAt.getTime() !== item.startsAt.getTime()) {
					// The detail page wins when the two disagree.
					event.startsAt = toEasternIso(detail.startsAt);
					event.matchKey = `${item.sourceUrl}#${easternDate(detail.startsAt)}`;
					event.warnings.push(WARNING_TIMES_DIFFER);
				}
			} catch (error) {
				errors.push(`detail ${item.sourceUrl}: ${errorMessage(error)}`);
				event.warnings.push(WARNING_DETAIL_FAILED);
			}
		} else {
			event.warnings.push(WARNING_DETAIL_PENDING);
		}

		if (events.has(event.matchKey)) {
			errors.push(`duplicate event skipped: ${event.matchKey}`);
			continue;
		}
		events.set(event.matchKey, event);
	}

	return {
		schemaVersion: SCHEMA_VERSION,
		sourceKey: source.key,
		startedAt: startedAt.toISOString(),
		finishedAt: new Date().toISOString(),
		stats: { requests: fetcher.stats.requests, failedRequests: fetcher.stats.failedRequests, detailsFetched },
		errors: [...fetcher.errors, ...errors],
		events: [...events.values()],
	};
};

// Never throws: a failure becomes a failed result so the other sources still run.
export const runSource = async (
	source: Source,
	options: { store?: SnapshotStore; save: boolean },
): Promise<SourceResult> => {
	const startedAt = new Date();
	const fetcher = createPoliteFetcher();
	let snapshot: Snapshot;
	let previous: Snapshot | null = null;

	try {
		previous = (await options.store?.readLatest(source.key)) ?? null;
		snapshot = await scrapeSource(source, previous, fetcher, startedAt);
	} catch (error) {
		snapshot = {
			schemaVersion: SCHEMA_VERSION,
			sourceKey: source.key,
			startedAt: startedAt.toISOString(),
			finishedAt: new Date().toISOString(),
			stats: { requests: fetcher.stats.requests, failedRequests: fetcher.stats.failedRequests, detailsFetched: 0 },
			errors: [...fetcher.errors, errorMessage(error)],
			events: [],
		};
	}

	const { requests, failedRequests } = snapshot.stats;
	let failure: string | null = null;
	if (snapshot.events.length === 0) {
		failure = `${source.key}: 0 events found, layout may have changed.`;
	} else if (failedRequests * 2 > requests) {
		failure = `${source.key}: ${failedRequests} of ${requests} requests failed.`;
	}
	if (failure) {
		console.error(failure);
		snapshot.errors.push(failure);
	}

	const failed = failure !== null;
	const diff = failed ? emptyDiff() : diffSnapshots(previous?.events ?? [], snapshot.events);
	let saved = false;
	if (options.save && options.store) {
		try {
			await options.store.saveRun({ snapshot, diff, failed });
			saved = true;
		} catch (error) {
			snapshot.errors.push(`save failed: ${errorMessage(error)}`);
			console.error(`${source.key}: could not save snapshot: ${errorMessage(error)}`);
		}
	}

	const summary: SourceSummary = {
		sourceKey: source.key,
		eventsFound: snapshot.events.length,
		newCount: diff.newEvents.length,
		changedCount: diff.changed.length,
		missingCount: diff.missingPast.length + diff.missingFuture.length,
		detailsFetched: snapshot.stats.detailsFetched,
		warningCount: snapshot.events.reduce((total, event) => total + event.warnings.length, 0),
		errors: snapshot.errors,
		failed,
		saved,
	};
	return { summary, snapshot, diff };
};

export const runSources = async (options: {
	sourceKey?: string;
	store?: SnapshotStore;
	save: boolean;
	sources?: Source[];
}): Promise<SourceResult[]> => {
	const sources = (options.sources ?? SOURCES).filter((source) => !options.sourceKey || source.key === options.sourceKey);
	if (sources.length === 0) throw new Error(`Unknown source: ${options.sourceKey}`);

	const results: SourceResult[] = [];
	for (const source of sources) {
		results.push(await runSource(source, options));
	}
	console.log(JSON.stringify(results.map((result) => result.summary)));
	return results;
};
