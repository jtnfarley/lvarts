import { runSources } from '@/lib/scraper/run';
import { blobSnapshotStore } from '@/lib/scraper/snapshots';

// Usage: npm run scrape -- [--source=godfrey] [--no-save]
const main = async (): Promise<void> => {
	const args = process.argv.slice(2);
	const sourceKey = args.find((arg) => arg.startsWith('--source='))?.slice('--source='.length);
	const save = !args.includes('--no-save');
	const hasBlobToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

	if (save && !hasBlobToken) {
		throw new Error('BLOB_READ_WRITE_TOKEN is required to save snapshots. Pass --no-save to print only.');
	}

	// With --no-save the previous snapshot is still read when a token is available, so the diff is realistic.
	const results = await runSources({ sourceKey, save, store: hasBlobToken ? blobSnapshotStore : undefined });

	if (!save) {
		for (const { snapshot, diff } of results) {
			console.log(JSON.stringify({ snapshot, diff }, null, 2));
		}
	}
	process.exitCode = results.some((result) => result.summary.failed) ? 1 : 0;
};

main().catch((error: unknown) => {
	console.error(error);
	process.exitCode = 1;
});
