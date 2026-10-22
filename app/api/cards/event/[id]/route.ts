import { renderEventCard } from '@/lib/cards/render';

export const runtime = 'nodejs';

const CACHE_CONTROL = 'public, s-maxage=3600, stale-while-revalidate=86400';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	if (!/^\d+$/.test(id)) return new Response('Not found', { status: 404 });

	const jpeg = await renderEventCard(Number(id));
	if (!jpeg) return new Response('Not found', { status: 404 });

	return new Response(new Uint8Array(jpeg), {
		headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': CACHE_CONTROL },
	});
}
