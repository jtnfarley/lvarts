import { notFound } from 'next/navigation';
import { isAdmin } from '@/lib/auth/isAdmin';
import { readIndex, readRawJson } from '@/lib/scraper/snapshots';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
	if (!(await isAdmin())) notFound();

	// Only paths listed in the run index are served, so the query can't reach other blobs.
	const path = new URL(request.url).searchParams.get('path');
	const runs = await readIndex();
	const run = runs.find((entry) => entry.snapshotPath === path || entry.diffPath === path);
	if (!path || !run) notFound();

	const body = await readRawJson(path);
	if (!body) notFound();

	return new Response(body, {
		headers: {
			'Content-Type': 'application/json',
			'Content-Disposition': `attachment; filename="${path.split('/').slice(1).join('-')}"`,
		},
	});
}
