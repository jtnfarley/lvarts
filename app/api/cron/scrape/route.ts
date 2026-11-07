import { NextResponse } from 'next/server';
import { runSources } from '@/lib/scraper/run';
import { blobSnapshotStore } from '@/lib/scraper/snapshots';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(request: Request) {
	const secret = process.env.CRON_SECRET;
	if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
		return new NextResponse('Unauthorized', { status: 401 });
	}

	const results = await runSources({ store: blobSnapshotStore, save: true });
	return NextResponse.json(results.map((result) => result.summary));
}
