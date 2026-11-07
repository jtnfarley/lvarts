import * as cheerio from 'cheerio';
import { easternWallTimeToDate } from '../eastern';
import type { EventDetail, ListingItem, SourceAdapter } from '../types';

const LISTING_URL = 'https://godfreydaniels.org/upcoming-events/';
const DESCRIPTION_MAX_LENGTH = 400;
const MIN_PARAGRAPH_LENGTH = 20;

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

// "Friday Nov 6th, 2026 @ 08:00 PM"
const DATE_TIME = /([A-Za-z]{3})[A-Za-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?,\s*(\d{4})\s*@\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i;

export const parseDateTime = (text: string): Date | null => {
	const match = DATE_TIME.exec(text);
	if (!match) return null;

	const month = MONTHS.indexOf(match[1].toLowerCase()) + 1;
	if (month === 0) return null;

	const hour12 = Number(match[4]) % 12;
	const hour = match[6].toUpperCase() === 'PM' ? hour12 + 12 : hour12;
	return easternWallTimeToDate(Number(match[3]), month, Number(match[2]), hour, Number(match[5]));
};

export const parseListing = (html: string): ListingItem[] => {
	const $ = cheerio.load(html);
	const items = new Map<string, ListingItem>();

	$('a[href*="/event/"]').each((_, link) => {
		const href = $(link).attr('href');
		if (!href) return;

		const startsAt = parseDateTime($(link).text());
		// The listing's own title element; the link text also holds the date and stray "Array" template text.
		const rawTitle = $(link).find('.heading2').first().text().replace(/\s+/g, ' ').trim();
		if (!startsAt || !rawTitle) return;

		const sourceUrl = new URL(href, LISTING_URL).href;
		items.set(`${sourceUrl}|${startsAt.toISOString()}`, { sourceUrl, rawTitle, startsAt });
	});

	return [...items.values()];
};

// Cut at a sentence end under the limit; fall back to a word boundary.
export const trimDescription = (text: string): string => {
	if (text.length <= DESCRIPTION_MAX_LENGTH) return text;

	const head = text.slice(0, DESCRIPTION_MAX_LENGTH);
	const sentenceEnd = Math.max(head.lastIndexOf('. '), head.lastIndexOf('! '), head.lastIndexOf('? '));
	if (sentenceEnd >= DESCRIPTION_MAX_LENGTH / 4) return head.slice(0, sentenceEnd + 1);
	return `${head.slice(0, head.lastIndexOf(' ')).trimEnd()}…`;
};

// Descriptions are a <p> or an <h4> depending on the page; skip image, button, and bio blocks.
const firstDescription = ($: cheerio.CheerioAPI): string | null => {
	let found: string | null = null;
	$('.single_event_listing p, .single_event_listing h4').each((_, element) => {
		const node = $(element);
		if (node.closest('figure, .wp-block-buttons, .wp-block-media-text').length > 0) return;

		const text = node.text().replace(/\s+/g, ' ').trim();
		if (text.length < MIN_PARAGRAPH_LENGTH) return;

		found = trimDescription(text);
		return false;
	});
	return found;
};

export const parseDetail = (html: string): EventDetail => {
	const $ = cheerio.load(html);
	const imageUrl = $('meta[property="og:image"]').attr('content')?.trim() || null;
	return {
		startsAt: parseDateTime($('body').text()),
		imageUrl,
		description: firstDescription($),
	};
};

export const godfreyAdapter: SourceAdapter = {
	fetchListing: async (getHtml) => parseListing(await getHtml(LISTING_URL)),
	fetchDetail: async (url, getHtml) => parseDetail(await getHtml(url)),
};
