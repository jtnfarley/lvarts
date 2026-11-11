import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { theme } from './theme';

type CardFont = { name: string; data: Buffer; weight: 400 | 600 | 700; style: 'normal' };

const FONT_FILES = [
	{ name: theme.fonts.display, file: 'Gilroy-SemiBold.ttf', weight: 600 },
	{ name: theme.fonts.cover, file: 'ChelseaMarket-Regular.ttf', weight: 400 },
	{ name: theme.fonts.body, file: 'CourierPrime-Regular.ttf', weight: 400 },
	{ name: theme.fonts.body, file: 'CourierPrime-Bold.ttf', weight: 700 },
] as const;

let cachedFonts: Promise<CardFont[]> | undefined;

const loadFonts = (): Promise<CardFont[]> =>
	Promise.all(
		FONT_FILES.map(async ({ name, file, weight }) => ({
			name,
			weight,
			style: 'normal' as const,
			data: await readFile(path.join(process.cwd(), 'assets', 'fonts', file)),
		})),
	);

// Read once per server instance.
export const getFonts = (): Promise<CardFont[]> => {
	cachedFonts ??= loadFonts().catch((error: unknown) => {
		cachedFonts = undefined;
		throw error;
	});
	return cachedFonts;
};
