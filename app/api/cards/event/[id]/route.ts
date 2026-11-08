import { isAdmin } from '@/lib/auth/isAdmin';
import { renderEventCard } from '@/lib/cards/render';

export const runtime = 'nodejs';

const CACHE_CONTROL = 'public, s-maxage=3600, stale-while-revalidate=86400';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	if (!/^\d+$/.test(id)) return new Response('Not found', { status: 404 });

	// ?preview=1 lets an admin render events that are still waiting for review. It is never cached.
	const wantsPreview = new URL(request.url).searchParams.get('preview') === '1';
	const isPreview = wantsPreview && (await isAdmin());

	const jpeg = await renderEventCard(Number(id), isPreview);
	if (!jpeg) return new Response('Not found', { status: 404 });

	return new Response(new Uint8Array(jpeg), {
		headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': isPreview ? 'private, no-store' : CACHE_CONTROL },
	});
}
