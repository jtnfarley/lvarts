import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"

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

    const { userdir, filename } = await req.json();
    if (!userdir || !filename) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const secret = process.env.UPLOAD_SECRET;
    if (!secret) throw new Error('Missing UPLOAD_SECRET env var');

    const token = await generateToken(userdir, filename, secret);
    return NextResponse.json({ token });
}
