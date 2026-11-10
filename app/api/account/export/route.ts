import { NextRequest, NextResponse } from 'next/server';
import { buildAccountExport } from '@/lib/accountExport';
import { getExportSecret, verifyExportToken } from '@/lib/exportToken';

const EXPIRED_MESSAGE = 'This download link is invalid or has expired. Request a new one from Settings.';

// Opened from an emailed link, often in a browser that is not signed in, so the signed
// token (not the session) says whose data this is.
export async function GET(request: NextRequest) {
    const userdetailsid = verifyExportToken(request.nextUrl.searchParams.get('token') ?? '', getExportSecret());
    if (!userdetailsid) return new NextResponse(EXPIRED_MESSAGE, { status: 401 });

    const data = await buildAccountExport(userdetailsid);
    if (!data) return new NextResponse(EXPIRED_MESSAGE, { status: 404 });

    const filename = `lvartsmusic-data-${new Date().toISOString().slice(0, 10)}.json`;
    return new NextResponse(JSON.stringify(data, null, 2), {
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Cache-Control': 'no-store',
        },
    });
}
