import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import type { ReactElement } from 'react';
import sharp from 'sharp';
import { getFonts } from './fonts';
import { CardEvent, getCardEvent } from './getCardEvent';
import { getRoundup, Roundup } from './getRoundup';
import { prepareImage } from './prepareImage';
import type { RoundupOptions } from './roundupWindow';
import { EventCard } from './templates/EventCard';
import { RoundupCover } from './templates/RoundupCover';
import { theme } from './theme';

// The owner-supplied logo wins; the site's existing tile is used until it exists.
const LOGO_PATHS = ['public/brand/logo.png', 'public/logos/arts-abbr-sq.png'];

let cachedLogoUrl: Promise<string> | undefined;

const loadLogoUrl = async (): Promise<string> => {
	for (const logoPath of LOGO_PATHS) {
		try {
			const file = await readFile(path.join(process.cwd(), logoPath));
			return `data:image/png;base64,${file.toString('base64')}`;
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
		}
	}
	throw new Error(`No logo found, looked in: ${LOGO_PATHS.join(', ')}`);
};

const getLogoUrl = (): Promise<string> => (cachedLogoUrl ??= loadLogoUrl());

const COVER_LOGO_PATH = 'public/logos/insta cards.png';

let cachedCoverLogoUrl: Promise<string> | undefined;

const getCoverLogoUrl = (): Promise<string> =>
	(cachedCoverLogoUrl ??= readFile(path.join(process.cwd(), COVER_LOGO_PATH)).then(
		(file) => `data:image/png;base64,${file.toString('base64')}`,
	));

// Instagram's API only accepts JPEG, so the PNG from satori is flattened and converted.
const renderToJpeg = async (card: ReactElement): Promise<Buffer> => {
	const response = new ImageResponse(card, { width: theme.width, height: theme.height, fonts: await getFonts() });
	const png = Buffer.from(await response.arrayBuffer());
	return sharp(png)
		.flatten({ background: theme.colors.paper })
		.jpeg({ quality: theme.jpegQuality, mozjpeg: true })
		.toBuffer();
};

export const renderCardForEvent = async (event: CardEvent): Promise<Buffer> => {
	const [image, logoUrl] = await Promise.all([
		event.imageUrl ? prepareImage(event.imageUrl) : null,
		getLogoUrl(),
	]);
	return renderToJpeg(EventCard({ event, image, logoUrl }));
};

// Returns null when the event doesn't exist or can't be rendered.
export const renderEventCard = async (id: number, includePrivate = false): Promise<Buffer | null> => {
	const result = await getCardEvent(id, includePrivate);
	if (!result?.ok) return null;
	return renderCardForEvent(result.event);
};

export const renderCoverForRoundup = async (roundup: Roundup): Promise<Buffer> =>
	renderToJpeg(
		RoundupCover({
			kind: roundup.kind,
			headline: roundup.headline,
			dateLabel: roundup.dateLabel,
			shownCount: roundup.events.length,
			moreCount: roundup.moreCount,
			logoUrl: await getCoverLogoUrl(),
		}),
	);

// Returns null when the window has no renderable events.
export const renderRoundupCover = async (options: RoundupOptions): Promise<Buffer | null> => {
	const roundup = await getRoundup(options);
	if (roundup.events.length === 0) return null;
	return renderCoverForRoundup(roundup);
};
