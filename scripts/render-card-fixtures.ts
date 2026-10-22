// Renders sample cards to a local folder for visual review.
// Usage: npx tsx scripts/render-card-fixtures.ts [outputDir]
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import type { CardEvent } from '@/lib/cards/getCardEvent';
import { renderCardForEvent, renderCoverForRoundup } from '@/lib/cards/render';
import { resolveWindow } from '@/lib/cards/roundupWindow';
import { cleanText } from '@/lib/cards/text';

const outputDir = path.resolve(process.argv[2] ?? 'card-fixtures');

const samplePhoto = async (width: number, height: number, label: string): Promise<string> => {
	const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
		<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
			<stop offset="0" stop-color="#1b4965"/><stop offset="1" stop-color="#bee9e8"/>
		</linearGradient></defs>
		<rect width="100%" height="100%" fill="url(#g)"/>
		<text x="50%" y="50%" font-size="${Math.round(width / 8)}" fill="white" text-anchor="middle" font-family="sans-serif">${label}</text>
	</svg>`;
	const jpeg = await sharp(Buffer.from(svg)).jpeg().toBuffer();
	return `data:image/jpeg;base64,${jpeg.toString('base64')}`;
};

const base: CardEvent = {
	id: 1,
	title: 'Open Mic Night',
	date: new Date('2026-10-25T00:00:00Z'),
	venueName: 'Godfrey Daniels',
	town: 'Bethlehem',
	snippet: 'Bring an instrument, a poem, or just your ears. Sign-up starts at 7 and the stage is yours until close.',
	url: 'lvartandmusic.com/post/1',
};

const longTitle =
	'The Lehigh Valley Spring Arts Showcase and Community Celebration of Local Painters, Poets and Musicians Together';

const buildEventFixtures = async (): Promise<Record<string, CardEvent>> => ({
	'short-title-10-chars': { ...base, title: 'Open Mic!!' },
	'long-title-120-chars-no-image': { ...base, title: longTitle.slice(0, 120) },
	'emoji-title': { ...base, title: cleanText('🎷 Jazz Night 🎉 with the Quartet 🎶') },
	'no-venue': { ...base, venueName: undefined, town: undefined },
	'no-time': { ...base, date: new Date('2026-10-24T04:00:00Z') },
	'tall-poster': { ...base, title: 'Tall Poster Show', imageUrl: await samplePhoto(800, 1200, 'POSTER') },
	'wide-photo': { ...base, title: 'Wide Photo Show, With A Fairly Long Title Here', imageUrl: await samplePhoto(1600, 900, 'PHOTO') },
	'small-image-falls-back': { ...base, imageUrl: await samplePhoto(400, 300, 'SMALL') },
	'broken-image-falls-back': { ...base, imageUrl: 'http://localhost:1/missing.jpg' },
});

const covers = [
	{ name: 'daily', window: resolveWindow({ preset: 'today', date: '2026-10-22' }), shownCount: 6, moreCount: 0 },
	{ name: 'weekend', window: resolveWindow({ preset: 'weekend', date: '2026-10-22' }), shownCount: 9, moreCount: 4 },
];

const main = async () => {
	const eventFixtures = await buildEventFixtures();
	await mkdir(outputDir, { recursive: true });

	for (const [name, event] of Object.entries(eventFixtures)) {
		await writeFile(path.join(outputDir, `event-${name}.jpg`), await renderCardForEvent(event));
	}
	for (const { name, window, shownCount, moreCount } of covers) {
		const jpeg = await renderCoverForRoundup({ ...window, events: Array(shownCount).fill(base), skipped: [], moreCount });
		await writeFile(path.join(outputDir, `cover-${name}.jpg`), jpeg);
	}

	console.log(`Wrote ${Object.keys(eventFixtures).length + covers.length} cards to ${outputDir}`);
};

main().catch((error: unknown) => {
	console.error(error);
	process.exit(1);
});
