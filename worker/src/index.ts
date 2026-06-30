export interface Env {
    BUNNY_KEY: string;
    UPLOAD_SECRET: string;
    ALLOWED_ORIGIN: string;
}
 
const STORAGE_HOSTNAME = 'ny.storage.bunnycdn.com';
const STORAGE_ZONE = 'lvartsmusic-ny';

async function verifyToken(token: string, userdir: string, filename: string, secret: string): Promise<boolean> {
    try {
        const dot = token.lastIndexOf('.');
        if (dot === -1) return false;
        const payload = token.slice(0, dot);
        const sig = token.slice(dot + 1);

        const { u, f, exp } = JSON.parse(atob(payload));
        if (u !== userdir || f !== filename) return false;
        if (Date.now() > exp) return false;

        const key = await crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(secret),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['verify']
        );
        const sigBytes = Uint8Array.from(atob(sig), c => c.charCodeAt(0));
        return crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(payload));
    } catch {
        return false;
    }
}

function corsHeaders(origin: string): Record<string, string> {
    return {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Upload-Token',
        'Access-Control-Max-Age': '86400',
    };
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const origin = env.ALLOWED_ORIGIN || '*';

        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: corsHeaders(origin) });
        }

        if (request.method !== 'PUT') {
            return new Response('Method not allowed', { status: 405 });
        }

        const url = new URL(request.url);
        const parts = url.pathname.replace(/^\/+/, '').split('/');
        if (parts.length < 2) {
            return new Response('Bad path', { status: 400, headers: corsHeaders(origin) });
        }
        const [userdir, ...rest] = parts;
        const filename = rest.join('/');

        const token = request.headers.get('X-Upload-Token');
        if (!token || !(await verifyToken(token, userdir, filename, env.UPLOAD_SECRET))) {
            return new Response('Unauthorized', { status: 401, headers: corsHeaders(origin) });
        }

        const bunnyUrl = `https://${STORAGE_HOSTNAME}/${STORAGE_ZONE}/${userdir}/${filename}`;
        const bunnyRes = await fetch(bunnyUrl, {
            method: 'PUT',
            headers: {
                'AccessKey': env.BUNNY_KEY,
                'Content-Type': 'application/octet-stream',
            },
            body: request.body,
        });

        if (!bunnyRes.ok) {
            const bunnyBody = await bunnyRes.text();
            console.error(`BunnyCDN ${bunnyRes.status}: ${bunnyBody}`);
            return new Response(`CDN upload failed: ${bunnyRes.status} ${bunnyBody}`, {
                status: 502,
                headers: corsHeaders(origin),
            });
        }

        return new Response(null, { status: 200, headers: corsHeaders(origin) });
    },
};
