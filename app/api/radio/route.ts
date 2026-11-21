import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const STATION_ID = 614

const webhookSchema = z.object({ station: z.object({ id: z.number() }) })

// AzuraCast webhook: only acknowledges payloads for our station. Nothing is acted on.
export async function POST(request: NextRequest) {
    const parsed = webhookSchema.safeParse(await request.json().catch(() => null));

    return NextResponse.json({ success: parsed.success && parsed.data.station.id === STATION_ID });
}
