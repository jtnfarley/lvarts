import { z } from "zod"
import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import { canUploadToUserdir } from "@/lib/auth/canUploadToUserdir"
import { isSafeFilename } from "@/lib/bunny"

const bodySchema = z.object({
    userdir: z.string().min(1),
    filename: z.string().min(1).max(255).refine(isSafeFilename, 'Invalid filename'),
})

async function generateToken(userdir: string, filename: string, secret: string): Promise<string> {
    const exp = Date.now() + 5 * 60 * 1000;
    const payload = btoa(JSON.stringify({ u: userdir, f: filename, exp }));

    const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    const sigBuffer = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
    const sig = btoa(String.fromCharCode(...new Uint8Array(sigBuffer)));

    return `${payload}.${sig}`;
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = bodySchema.safeParse(await req.json().catch(() => null));
    if (!body.success) return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
    const { userdir, filename } = body.data;

    // The token lets the caller write into this folder, so it must be one they may use.
    if (!(await canUploadToUserdir(userdir))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const secret = process.env.UPLOAD_SECRET;
    if (!secret) throw new Error('Missing UPLOAD_SECRET env var');

    const token = await generateToken(userdir, filename, secret);
    return NextResponse.json({ token });
}
