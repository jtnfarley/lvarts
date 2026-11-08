import imageUrl from '@/constants/imageUrl';
import { uploadFile } from '@/app/actions/fileUploader';
import type { PoliteFetcher } from '../scraper/http';
import type { ScrapedEvent } from '../scraper/types';
import type { StoredImage } from './sync';

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

// Must match rows in the filetypes table.
const EXTENSION_BY_TYPE: Record<string, string> = {
	'image/png': 'png',
	'image/jpeg': 'jpg',
	'image/webp': 'webp',
};

// Storage paths are used unencoded in image URLs, so keep file names to a safe character set.
export const imageFilename = (event: ScrapedEvent, extension: string): string => {
	const slug = new URL(event.sourceUrl).pathname.split('/').filter(Boolean).pop() ?? 'event';
	const date = event.matchKey.split('#')[1] ?? 'undated';
	return `${slug.toLowerCase().replace(/[^a-z0-9-]/g, '-')}-${date}.${extension}`;
};

// Downloads the event's promo image once and stores it under the calendar account's folder.
// Returns null (and logs why) when anything goes wrong, so the post can still be created without an image.
export const downloadAndStoreImage = async (
	event: ScrapedEvent,
	fetcher: PoliteFetcher,
	userdir: string,
): Promise<StoredImage | null> => {
	if (!event.imageUrl) return null;

	try {
		const { data, contentType } = await fetcher.getBinary(event.imageUrl);
		const filetype = contentType.split(';')[0].trim().toLowerCase();
		const extension = EXTENSION_BY_TYPE[filetype];
		if (!extension) throw new Error(`unsupported image type "${filetype}"`);
		if (data.byteLength === 0 || data.byteLength > MAX_IMAGE_BYTES) throw new Error(`bad image size ${data.byteLength}`);

		const filename = imageFilename(event, extension);
		await uploadFile({ file: new File([data], filename, { type: filetype }), userdir });

		// uploadFile doesn't report storage errors, so confirm the file is actually served.
		const check = await fetch(`${imageUrl}/${userdir}/${filename}`, { method: 'HEAD' });
		if (!check.ok) throw new Error(`stored image not found on the CDN (${check.status})`);
		return { filename, filetype };
	} catch (error) {
		console.error(`image for ${event.sourceUrl} failed: ${error instanceof Error ? error.message : String(error)}`);
		return null;
	}
};
