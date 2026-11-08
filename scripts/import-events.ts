import { prisma } from '@/prisma';
import { runImport } from '@/lib/importer/run';

// Usage: npm run import-events -- [--dry-run] [--source=godfrey]
const main = async (): Promise<void> => {
	const args = process.argv.slice(2);
	const dryRun = args.includes('--dry-run');
	const sourceKey = args.find((arg) => arg.startsWith('--source='))?.slice('--source='.length);

	const results = await runImport({ dryRun, sourceKey });

	if (dryRun) {
		for (const { summary, actions } of results) {
			console.log(`\n${summary.sourceKey} (dry run, nothing written):`);
			for (const action of actions) {
				const detail =
					action.kind === 'update'
						? [
								action.eventName && `title -> ${action.eventName}`,
								action.eventDate && `time -> ${action.eventDate.toISOString()}`,
								action.rewriteContent && 'rewrite content',
								action.sendToPending && 'send to pending',
							]
								.filter(Boolean)
								.join(', ')
						: action.kind === 'skip'
							? action.reason
							: action.isPrivate
								? 'pending'
								: 'published';
				console.log(`  ${action.kind.padEnd(6)} ${action.event.startsAt.slice(0, 16)} ${action.event.headline} (${detail})`);
			}
		}
	}
	process.exitCode = results.some((result) => result.summary.errors.length > 0 || result.summary.skippedBecause) ? 1 : 0;
};

main()
	.catch((error: unknown) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(() => prisma.$disconnect());
