import sharp from 'sharp';
import { theme } from './theme';

export const IMAGE_PANEL_HEIGHT = 810;
const MIN_SOURCE_WIDTH = 600;
const FETCH_TIMEOUT_MS = 8000;

export type PreparedImage = {
	fittedUrl: string;
	fittedWidth: number;
	fittedHeight: number;
	backdropUrl: string;
};

const toDataUrl = (buffer: Buffer): string => `data:image/jpeg;base64,${buffer.toString('base64')}`;

// Returns null when the image can't be used; callers fall back to the no-image layout.
export const prepareImage = async (url: string): Promise<PreparedImage | null> => {
	try {
		const response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
		if (!response.ok) throw new Error(`Image request failed with status ${response.status}`);
		const source = Buffer.from(await response.arrayBuffer());

		const oriented = sharp(source).rotate();
		const { width } = await sharp(await oriented.toBuffer()).metadata();
		if (!width || width < MIN_SOURCE_WIDTH) return null;

		const fitted = await oriented
			.clone()
			.resize({ width: theme.width, height: IMAGE_PANEL_HEIGHT, fit: 'inside' })
			.flatten({ background: theme.colors.cream })
			.jpeg({ quality: 88 })
			.toBuffer({ resolveWithObject: true });

		const backdrop = await oriented
			.clone()
			.resize({ width: 270, height: 203, fit: 'cover' })
			.blur(8)
			.modulate({ brightness: 0.55 })
			.flatten({ background: theme.colors.ink })
			.jpeg({ quality: 70 })
			.toBuffer();

		return {
			fittedUrl: toDataUrl(fitted.data),
			fittedWidth: fitted.info.width,
			fittedHeight: fitted.info.height,
			backdropUrl: toDataUrl(backdrop),
		};
	} catch (error) {
		console.error(`Card image unusable, falling back to the no-image layout: ${url}`, error);
		return null;
	}
};
