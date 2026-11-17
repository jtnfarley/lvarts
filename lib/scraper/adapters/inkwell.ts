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

// Descriptions repeat the date with a weekday ("Friday, November 13, 2026 | Doors: 6:30 PM | Music: 7 PM"). Requiring the
// weekday skips ranges, deadlines and "on November 13" asides, and lets us check the date against the calendar.
const DESCRIPTION_DATE =
	/\b(mon|tue|wed|thu|fri|sat|sun)[a-z]*\.?,?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s+(20\d{2}))?\b/gi;
const TIME_OF_DAY = /\b(\d{1,2})(?::(\d{2}))?\s*(AM|PM)\b/gi;
// How far past a date we look for its time.
const TIME_WINDOW = 160;

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

const to24Hour = (hourText: string, meridiem: string): number => {
	const hour12 = Number(hourText) % 12;
	return meridiem.toUpperCase() === 'PM' ? hour12 + 12 : hour12;
};

// A missing year means the next occurrence of that date on or after today.
const resolveStart = (month: number, day: number, year: number | undefined, hour: number, minute: number, now: Date): ParsedVariantStart => {
	if (year) return { startsAt: easternWallTimeToDate(year, month, day, hour, minute), yearAssumed: false };

	const thisYear = easternParts(now).year;
	const startsAt = easternWallTimeToDate(thisYear, month, day, hour, minute);
	if (startsAt >= startOfEasternDay(now)) return { startsAt, yearAssumed: true };
	return { startsAt: easternWallTimeToDate(thisYear + 1, month, day, hour, minute), yearAssumed: true };
};

export const parseVariantStart = (variantTitle: string, now: Date): ParsedVariantStart | null => {
	const match = VARIANT_DATE.exec(variantTitle.split(' / ')[0]);
	if (!match) return null;

	const month = MONTHS.indexOf(match[1].toLowerCase()) + 1;
	return resolveStart(month, Number(match[2]), match[3] ? Number(match[3]) : undefined, to24Hour(match[4], match[6]), Number(match[5] ?? 0), now);
};

// The show time, not the doors time, unless doors is all the text gives.
const findStartTime = (text: string): { hour: number; minute: number } | null => {
	let doorsTime: { hour: number; minute: number } | null = null;
	for (const match of text.matchAll(TIME_OF_DAY)) {
		const time = { hour: to24Hour(match[1], match[3]), minute: Number(match[2] ?? 0) };
		if (!/doors?/i.test(text.slice(Math.max(0, match.index - 15), match.index))) return time;
		doorsTime ??= time;
	}
	return doorsTime;
};

export type DescriptionStarts = { starts: ParsedVariantStart[]; mismatches: string[] };

// Dates with a weekday and a time, one per day. A weekday that doesn't match the calendar is a typo we won't trust.
export const parseDescriptionStarts = (text: string, now: Date): DescriptionStarts => {
	const matches = [...text.matchAll(DESCRIPTION_DATE)];
	const startsByDate = new Map<string, ParsedVariantStart>();
	const mismatches: string[] = [];

	matches.forEach((match, index) => {
		const windowStart = match.index + match[0].length;
		const windowEnd = Math.min(matches[index + 1]?.index ?? Infinity, windowStart + TIME_WINDOW);
		const time = findStartTime(text.slice(windowStart, windowEnd));
		if (!time) return;

		const month = MONTHS.indexOf(match[2].toLowerCase()) + 1;
		const parsed = resolveStart(month, Number(match[3]), match[4] ? Number(match[4]) : undefined, time.hour, time.minute, now);
		if (easternParts(parsed.startsAt).weekday !== match[1].toUpperCase()) {
			mismatches.push(match[0]);
			return;
		}
		const date = easternDate(parsed.startsAt);
		if (!startsByDate.has(date)) startsByDate.set(date, parsed);
	});

	return { starts: [...startsByDate.values()], mismatches };
};

// Shopify titles use "|" as a separator (which cleanTitle reads as an en dash) and sometimes open a quote they never close.
export const normalizeTitle = (title: string): string => {
	const quoteCount = title.split('"').length - 1;
	const unquoted = title.startsWith('"') && quoteCount % 2 === 1 ? title.slice(1) : title;
	return unquoted.replace(/\s+\|\s+/g, ' – ').trim();
};

const htmlToText = (bodyHtml: string | null): string => {
	if (!bodyHtml) return '';
	// Without a space before block tags, paragraphs run together ("8 PMinkwell.") and the time can't be read.
	const spaced = bodyHtml.replace(/<(p|div|br|li|h[1-6]|tr)\b/gi, ' <$1');
	return cheerio.load(spaced).root().text().replace(/\s+/g, ' ').trim();
};

type Product = z.infer<typeof productsSchema>['products'][number];

// Variant dates are the source of truth. The description fills in when no variant has a date, and corrects a lone
// variant date that disagrees with the one date the description names (the description's weekday is checked, the variant's isn't).
// Several described dates are ambiguous (on-sale dates, deadlines), so those are never used.
const chooseStarts = (product: Product, description: string, now: Date, report: (message: string) => void): ParsedVariantStart[] => {
	const label = `"${product.title}" (${product.handle})`;
	const variantStarts = product.variants.flatMap((variant) => parseVariantStart(variant.title, now) ?? []);
	const described = parseDescriptionStarts(description, now);
	for (const mismatch of described.mismatches) report(`inkwell: ignored "${mismatch}" in the description of ${label}, the weekday doesn't match that date`);

	if (described.starts.length > 1) {
		if (variantStarts.length === 0) report(`inkwell: ${label} names ${described.starts.length} dates in its description and none in its variants, not guessing`);
		return variantStarts;
	}
	const [describedStart] = described.starts;
	if (!describedStart) return variantStarts;
	if (variantStarts.length === 0) return [describedStart];

	const variantDates = new Set(variantStarts.map((parsed) => easternDate(parsed.startsAt)));
	if (variantDates.size === 1 && !variantDates.has(easternDate(describedStart.startsAt))) {
		report(`inkwell: the variant date of ${label} disagrees with its description, used the description`);
		return [describedStart];
	}
	return variantStarts;
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
				const text = htmlToText(product.body_html);
				// Price tiers share a product and a date, so they collapse into one event per date.
				const startsByDate = new Map<string, Date>();
				let assumedYear = false;

				for (const parsed of chooseStarts(product, text, now(), report)) {
					if (parsed.startsAt < today) continue;

					const date = easternDate(parsed.startsAt);
					const earliest = startsByDate.get(date);
					if (!earliest || parsed.startsAt < earliest) startsByDate.set(date, parsed.startsAt);
					assumedYear ||= parsed.yearAssumed;
				}

				if (startsByDate.size === 0) {
					// A product with no upcoming date (recurring series, sign-up pages) cannot become an event.
					report(`inkwell: skipped "${product.title}" (${product.handle}), no upcoming date in its variants or description`);
					continue;
				}
				if (assumedYear) report(`inkwell: no year in the dates of "${product.title}" (${product.handle}), assumed the next occurrence`);

				const rawTitle = normalizeTitle(product.title);
				for (const startsAt of startsByDate.values()) items.push({ sourceUrl, rawTitle, startsAt });
				detailsByUrl.set(sourceUrl, {
					startsAt: null,
					imageUrl: product.images[0]?.src ?? null,
					description: text ? trimDescription(text) : null,
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
