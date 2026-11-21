import { NextResponse } from 'next/server';
import { isCronRequest } from '@/lib/auth/isCronRequest';
import { runImport } from '@/lib/importer/run';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(request: Request) {
	if (!isCronRequest(request)) {
		return new NextResponse('Unauthorized', { status: 401 });
	}

	const results = await runImport({ dryRun: false });
	return NextResponse.json(results.map((result) => result.summary));
}
