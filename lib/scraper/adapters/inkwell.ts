import * as cheerio from 'cheerio';
import { z } from 'zod';
import { easternDate, easternWallTimeToDate } from '../eastern';
import { easternParts } from '@/lib/cards/text';
import type { EventDetail, ListingItem, SourceAdapter } from '../types';
import { trimDescription } from './godfrey';

const ORIGIN = 'https://atruelovestoryllc.com';
const PRODUCTS_URL = `${ORIGIN}/collections/ticketed-events/products.json?limit=250`;
const PRODUCTS_LIMIT = 250;

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

// Variant titles look like "November 27, 2026 08:00 PM / General Admission",
// "Tuesday, November 25th 2026 | 7 PM / ..." or "December 4th | 8 PM / ...". The year can be missing.
const VARIANT_DATE =
	/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s*(\d{4}))?[\s|@,-]*(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i;

const productsSchema = z.object({
	products: z.array(
		z.object({
			title: z.string(),
			handle: z.string(),
			body_html: z.string().nullable(),
			images: z.array(z.object({ src: z.string() })),
			variants: z.array(z.object({ title: z.string() })),
		}),
	),
});

const startOfEasternDay = (now: Date): Date => {
	const { year, month, day } = easternParts(now);
	return easternWallTimeToDate(year, month, day);
};

export type ParsedVariantStart = { startsAt: Date; yearAssumed: boolean };

// A missing year means the next occurrence of that date on or after today.
export const parseVariantStart = (variantTitle: string, now: Date): ParsedVariantStart | null => {
	const match = VARIANT_DATE.exec(variantTitle.split(' / ')[0]);
	if (!match) return null;

	const month = MONTHS.indexOf(match[1].toLowerCase()) + 1;
	const day = Number(match[2]);
	const hour12 = Number(match[4]) % 12;
	const hour = match[6].toUpperCase() === 'PM' ? hour12 + 12 : hour12;
	const minute = Number(match[5] ?? 0);

	if (match[3]) return { startsAt: easternWallTimeToDate(Number(match[3]), month, day, hour, minute), yearAssumed: false };

	const thisYear = easternParts(now).year;
	const startsAt = easternWallTimeToDate(thisYear, month, day, hour, minute);
	if (startsAt >= startOfEasternDay(now)) return { startsAt, yearAssumed: true };
	return { startsAt: easternWallTimeToDate(thisYear + 1, month, day, hour, minute), yearAssumed: true };
};

// Shopify titles use "|" as a separator (which cleanTitle reads as an en dash) and sometimes open a quote they never close.
export const normalizeTitle = (title: string): string => {
	const quoteCount = title.split('"').length - 1;
	const unquoted = title.startsWith('"') && quoteCount % 2 === 1 ? title.slice(1) : title;
	return unquoted.replace(/\s+\|\s+/g, ' – ').trim();
};

const descriptionFromHtml = (bodyHtml: string | null): string | null => {
	if (!bodyHtml) return null;
	const $ = cheerio.load(bodyHtml);
	const text = $.root().text().replace(/\s+/g, ' ').trim();
	return text ? trimDescription(text) : null;
};

export const createInkwellAdapter = (now: () => Date = () => new Date()): SourceAdapter => {
	// fetchListing already has every product, so details come from here instead of one request per event.
	const detailsByUrl = new Map<string, EventDetail>();

	return {
		fetchListing: async (getHtml, report) => {
			const { products } = productsSchema.parse(JSON.parse(await getHtml(PRODUCTS_URL)));
			if (products.length >= PRODUCTS_LIMIT) {
				throw new Error(`inkwell: ${products.length} products returned, the listing needs pagination`);
			}

			const today = startOfEasternDay(now());
			const items: ListingItem[] = [];
			detailsByUrl.clear();

			for (const product of products) {
				const sourceUrl = `${ORIGIN}/products/${product.handle}`;
				// Price tiers share a product and a date, so they collapse into one event per date.
				const startsByDate = new Map<string, Date>();
				let assumedYear = false;

				for (const variant of product.variants) {
					const parsed = parseVariantStart(variant.title, now());
					if (!parsed || parsed.startsAt < today) continue;

					const date = easternDate(parsed.startsAt);
					const earliest = startsByDate.get(date);
					if (!earliest || parsed.startsAt < earliest) startsByDate.set(date, parsed.startsAt);
					assumedYear ||= parsed.yearAssumed;
				}

				if (startsByDate.size === 0) {
					// A product with no dated variant (or only past ones) cannot become an event.
					report(`inkwell: skipped "${product.title}" (${product.handle}), no upcoming date in its variants`);
					continue;
				}
				if (assumedYear) report(`inkwell: no year in the variants of "${product.title}" (${product.handle}), assumed the next occurrence`);

				const rawTitle = normalizeTitle(product.title);
				for (const startsAt of startsByDate.values()) items.push({ sourceUrl, rawTitle, startsAt });
				detailsByUrl.set(sourceUrl, {
					startsAt: null,
					imageUrl: product.images[0]?.src ?? null,
					description: descriptionFromHtml(product.body_html),
				});
			}
			return items;
		},

		fetchDetail: async (url) => {
			const detail = detailsByUrl.get(url);
			if (!detail) throw new Error(`inkwell: no listing data for ${url}`);
			return detail;
		},
	};
};

export const inkwellAdapter = createInkwellAdapter();
