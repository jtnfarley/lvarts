import { isAdmin } from '@/lib/auth/isAdmin';
import { renderRoundupCover } from '@/lib/cards/render';
import { InvalidRoundupInput, RoundupOptions } from '@/lib/cards/roundupWindow';

export const runtime = 'nodejs';

const PUBLIC_CACHE_CONTROL = 'public, s-maxage=3600, stale-while-revalidate=86400';
// A custom title is admin-only, so that response must not be served from a shared cache.
const PRIVATE_CACHE_CONTROL = 'private, no-store';

const parseOptions = (params: URLSearchParams, allowTitle: boolean): RoundupOptions => {
	const preset = params.get('preset');
	if (preset !== null && preset !== 'today' && preset !== 'weekend') {
		throw new InvalidRoundupInput(`Unknown preset "${preset}"`);
	}
	return {
		preset: preset ?? undefined,
		date: params.get('date') ?? undefined,
		start: params.get('start') ?? undefined,
		end: params.get('end') ?? undefined,
		title: allowTitle ? (params.get('title') ?? undefined) : undefined,
	};
};

export async function GET(request: Request) {
	try {
		const options = parseOptions(new URL(request.url).searchParams, await isAdmin());
		const jpeg = await renderRoundupCover(options);
		if (!jpeg) return new Response('No events', { status: 404 });

		return new Response(new Uint8Array(jpeg), {
			headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': options.title ? PRIVATE_CACHE_CONTROL : PUBLIC_CACHE_CONTROL },
		});
	} catch (error) {
		if (error instanceof InvalidRoundupInput) return new Response(error.message, { status: 400 });
		throw error;
	}
}
