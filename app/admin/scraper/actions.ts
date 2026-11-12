'use server';

import { revalidatePath } from 'next/cache';
import { notFound } from 'next/navigation';
import { isAdmin } from '@/lib/auth/isAdmin';
import { runSources } from '@/lib/scraper/run';
import { blobSnapshotStore } from '@/lib/scraper/snapshots';
import { SOURCES } from '@/lib/scraper/sources';

export async function runScraperNow(): Promise<void> {
	if (!(await isAdmin())) notFound();

	await runSources({ store: blobSnapshotStore, save: true });
	revalidatePath('/admin/scraper');
}

// Server action arguments come from the browser, so the key is checked against the registry before it is used.
export async function runSourceNow(sourceKey: string): Promise<void> {
	if (!(await isAdmin())) notFound();
	if (!SOURCES.some((source) => source.key === sourceKey)) throw new Error(`Unknown source: ${sourceKey}`);

	await runSources({ sourceKey, store: blobSnapshotStore, save: true });
	revalidatePath('/admin/scraper');
}
