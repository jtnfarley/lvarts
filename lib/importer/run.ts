import { createPoliteFetcher } from '../scraper/http';
import { blobSnapshotStore, type SnapshotStore } from '../scraper/snapshots';
import { SCHEMA_VERSION, type ScrapedEvent, type Snapshot } from '../scraper/types';
import { createPrismaImportStore, findVenueId, getCalendarAccount, loadExistingEvents, loadVenueLookup } from './db';
import { downloadAndStoreImage } from './images';
import { IMPORT_SOURCES, shouldAutoPublish, type ImportSource } from './sources';
import {
	applyActions,
	countActions,
	emptyCounts,
	planSync,
	type ExistingEvent,
	type ImportStore,
	type StoredImage,
	type SyncAction,
	type SyncCounts,
} from './sync';
import { resolveVenueId } from './venues';

export const MAX_SNAPSHOT_AGE_MS = 36 * 60 * 60 * 1000;

export type ImportSummary = SyncCounts & {
	sourceKey: string;
	// Why the whole source was skipped, if it was.
	skippedBecause: string | null;
	errors: string[];
};

export type ImportDeps = {
	snapshots: Pick<SnapshotStore, 'readLatest'>;
	loadExisting: () => Promise<ExistingEvent[]>;
	store: ImportStore;
	venueIdFor: (event: ScrapedEvent) => number | null;
	storeImage: (event: ScrapedEvent) => Promise<StoredImage | null>;
	now: Date;
};

export type SourceImportResult = { summary: ImportSummary; actions: SyncAction[] };

// Returns why a snapshot cannot be trusted, or null when it is fresh and from a healthy run.
export const unusableSnapshotReason = (snapshot: Snapshot | null, now: Date): string | null => {
	if (!snapshot) return 'no snapshot found';
	if (snapshot.schemaVersion !== SCHEMA_VERSION) return `unsupported schema version ${snapshot.schemaVersion}`;
	if (now.getTime() - new Date(snapshot.finishedAt).getTime() > MAX_SNAPSHOT_AGE_MS) return 'snapshot is older than 36 hours';
	if (snapshot.events.length === 0) return 'snapshot has no events';
	if (snapshot.stats.failedRequests * 2 > snapshot.stats.requests) return 'most requests in the scrape failed';
	return null;
};

const emptySummary = (sourceKey: string): ImportSummary => ({
	...emptyCounts(),
	sourceKey,
	skippedBecause: null,
	errors: [],
});

// Plans one source's import and, unless dryRun is set, applies it. Never throws.
export const importSource = async (
	source: ImportSource,
	deps: ImportDeps,
	options: { dryRun: boolean },
): Promise<SourceImportResult> => {
	const summary = emptySummary(source.scraperKey);

	try {
		const snapshot = await deps.snapshots.readLatest(source.scraperKey);
		const unusable = unusableSnapshotReason(snapshot, deps.now);
		if (!snapshot || unusable) {
			summary.skippedBecause = unusable;
			console.error(`${source.scraperKey}: no fresh snapshot, import skipped (${unusable})`);
			return { summary, actions: [] };
		}

		const actions = planSync(snapshot.events, await deps.loadExisting(), {
			autoPublish: shouldAutoPublish(source),
			venueIdFor: deps.venueIdFor,
		});
		if (options.dryRun) return { summary: { ...summary, ...countActions(actions) }, actions };

		const applied = await applyActions(actions, { store: deps.store, storeImage: deps.storeImage });
		return { summary: { ...summary, ...applied.counts, errors: applied.errors }, actions };
	} catch (error) {
		summary.errors.push(error instanceof Error ? error.message : String(error));
		console.error(`${source.scraperKey}: import failed: ${summary.errors[0]}`);
		return { summary, actions: [] };
	}
};

const venueResolverFor = async (source: ImportSource): Promise<ImportDeps['venueIdFor']> => {
	if (source.venue === 'fixed') {
		const venueId = await findVenueId(source.venueName);
		return () => venueId;
	}
	const lookup = await loadVenueLookup(source.scraperKey);
	return (event) => resolveVenueId(lookup, event);
};

export const runImport = async (options: { dryRun: boolean; sourceKey?: string }): Promise<SourceImportResult[]> => {
	const sources = IMPORT_SOURCES.filter((source) => !options.sourceKey || source.scraperKey === options.sourceKey);
	if (sources.length === 0) throw new Error(`Unknown source: ${options.sourceKey}`);

	const results: SourceImportResult[] = [];
	for (const source of sources) {
		try {
			const account = await getCalendarAccount();
			const fetcher = createPoliteFetcher();
			results.push(
				await importSource(
					source,
					{
						snapshots: blobSnapshotStore,
						loadExisting: () => loadExistingEvents(account),
						store: createPrismaImportStore(account),
						venueIdFor: await venueResolverFor(source),
						storeImage: (event) => downloadAndStoreImage(event, fetcher, account.userdir),
						now: new Date(),
					},
					options,
				),
			);
		} catch (error) {
			// Setup problems (missing account or venue) fail this source only.
			const message = error instanceof Error ? error.message : String(error);
			console.error(`${source.scraperKey}: import failed: ${message}`);
			results.push({ actions: [], summary: { ...emptySummary(source.scraperKey), errors: [message] } });
		}
	}
	console.log(JSON.stringify(results.map((result) => result.summary)));
	return results;
};
