import { get, put } from '@vercel/blob';
import {
	runDiffSchema,
	runIndexSchema,
	snapshotSchema,
	type RunDiff,
	type RunIndexEntry,
	type Snapshot,
} from './types';

const RUNS_KEPT_PER_SOURCE = 30;
const INDEX_PATH = 'scraper/index.json';

export type SaveRunInput = {
	snapshot: Snapshot;
	diff: RunDiff;
	// A failed run is recorded for the review page but never becomes latest.json.
	failed: boolean;
};

export type SnapshotStore = {
	readLatest(sourceKey: string): Promise<Snapshot | null>;
	saveRun(input: SaveRunInput): Promise<RunIndexEntry>;
};

export const readRawJson = async (pathname: string): Promise<string | null> => {
	const result = await get(pathname, { access: 'private', useCache: false });
	if (!result || result.statusCode !== 200) return null;
	return new Response(result.stream).text();
};

const readJson = async (pathname: string): Promise<unknown> => {
	const text = await readRawJson(pathname);
	return text ? JSON.parse(text) : null;
};

const writeJson = async (pathname: string, value: unknown): Promise<void> => {
	await put(pathname, JSON.stringify(value, null, 2), {
		access: 'private',
		contentType: 'application/json',
		addRandomSuffix: false,
		allowOverwrite: true,
	});
};

export const readIndex = async (): Promise<RunIndexEntry[]> => {
	const raw = await readJson('scraper/index.json');
	return raw ? runIndexSchema.parse(raw).runs : [];
};

export const readSnapshot = async (pathname: string): Promise<Snapshot | null> => {
	const raw = await readJson(pathname);
	return raw ? snapshotSchema.parse(raw) : null;
};

export const readDiff = async (pathname: string): Promise<RunDiff | null> => {
	const raw = await readJson(pathname);
	return raw ? runDiffSchema.parse(raw) : null;
};

// Colons and dots are awkward in file names.
const runStamp = (startedAt: string): string => startedAt.replace(/[:.]/g, '-');

const countWarnings = (snapshot: Snapshot): number =>
	snapshot.events.reduce((total, event) => total + event.warnings.length, 0);

export const blobSnapshotStore: SnapshotStore = {
	readLatest: (sourceKey) => readSnapshot(`scraper/${sourceKey}/latest.json`),

	saveRun: async ({ snapshot, diff, failed }) => {
		const base = `scraper/${snapshot.sourceKey}/${runStamp(snapshot.startedAt)}`;
		const entry: RunIndexEntry = {
			sourceKey: snapshot.sourceKey,
			startedAt: snapshot.startedAt,
			finishedAt: snapshot.finishedAt,
			snapshotPath: `${base}.json`,
			diffPath: `${base}.diff.json`,
			eventCount: snapshot.events.length,
			newCount: diff.newEvents.length,
			changedCount: diff.changed.length,
			missingCount: diff.missingPast.length + diff.missingFuture.length,
			warningCount: countWarnings(snapshot),
			errorCount: snapshot.errors.length,
			failed,
		};

		await writeJson(entry.snapshotPath, snapshot);
		await writeJson(entry.diffPath, diff);
		if (!failed) await writeJson(`scraper/${snapshot.sourceKey}/latest.json`, snapshot);

		const existing = await readIndex();
		const ofThisSource = existing.filter((run) => run.sourceKey === snapshot.sourceKey);
		const others = existing.filter((run) => run.sourceKey !== snapshot.sourceKey);
		const kept = [entry, ...ofThisSource].slice(0, RUNS_KEPT_PER_SOURCE);
		await writeJson(INDEX_PATH, { runs: [...kept, ...others] });
		return entry;
	},
};
