'use server';

import { revalidatePath } from 'next/cache';
import { notFound } from 'next/navigation';
import { isAdmin } from '@/lib/auth/isAdmin';
import { runSources } from '@/lib/scraper/run';
import { blobSnapshotStore } from '@/lib/scraper/snapshots';

export async function runScraperNow(): Promise<void> {
	if (!(await isAdmin())) notFound();

	await runSources({ store: blobSnapshotStore, save: true });
	revalidatePath('/admin/scraper');
}
