import { renderRoundupCover } from '@/lib/cards/render';
import { InvalidRoundupInput, RoundupOptions } from '@/lib/cards/roundupWindow';

export const runtime = 'nodejs';

const CACHE_CONTROL = 'public, s-maxage=3600, stale-while-revalidate=86400';

const parseOptions = (params: URLSearchParams): RoundupOptions => {
	const preset = params.get('preset');
	if (preset !== null && preset !== 'today' && preset !== 'weekend') {
		throw new InvalidRoundupInput(`Unknown preset "${preset}"`);
	}
	return {
		preset: preset ?? undefined,
		date: params.get('date') ?? undefined,
		start: params.get('start') ?? undefined,
		end: params.get('end') ?? undefined,
	};
};

export async function GET(request: Request) {
	try {
		const jpeg = await renderRoundupCover(parseOptions(new URL(request.url).searchParams));
		if (!jpeg) return new Response('No events', { status: 404 });

		return new Response(new Uint8Array(jpeg), {
			headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': CACHE_CONTROL },
		});
	} catch (error) {
		if (error instanceof InvalidRoundupInput) return new Response(error.message, { status: 400 });
		throw error;
	}
}
