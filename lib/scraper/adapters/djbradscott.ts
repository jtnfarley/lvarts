import * as cheerio from 'cheerio';
import { z } from 'zod';
import type { EventDetail, ListingItem, ScrapedVenue, SourceAdapter } from '../types';
import { trimDescription } from './godfrey';

const ORIGIN = 'https://www.djbradfscott.com';
// Squarespace serves the event collection as JSON; `upcoming` is every future event, `past` is paged.
const EVENTS_URL = `${ORIGIN}/event-calendar?format=json`;

const eventsSchema = z.object({
	pagination: z.object({ pageSize: z.number() }),
	upcoming: z.array(
		z.object({
			title: z.string(),
			fullUrl: z.string(),
			startDate: z.number(),
			assetUrl: z.string().nullish(),
			body: z.string().nullish(),
		}),
	),
});

// Brad leaves Squarespace's location field empty, so the venue is only in the title or the text.
// Each rule is a place he plays; anything else is left for an admin to resolve. Keep addresses to what the site states.
type VenueRule = { pattern: RegExp; venue: ScrapedVenue };

export const VENUE_RULES: VenueRule[] = [
	{
		pattern: /bucks county playhouse|playhouse deck/i,
		venue: { name: 'Bucks County Playhouse', address: '70 S Main St', city: 'New Hope', state: 'PA', zip: '18938' },
	},
	{ pattern: /broad hall/i, venue: { name: 'Broad Hall', address: '699 N Broad St', city: 'Philadelphia', state: 'PA', zip: '19123' } },
	{ pattern: /lafayette bar/i, venue: { name: 'Lafayette Bar', address: '15 N 4th St', city: 'Easton', state: 'PA' } },
	{ pattern: /lost tavern brewing/i, venue: { name: 'Lost Tavern Brewing' } },
	{ pattern: /allentown art museum/i, venue: { name: 'Allentown Art Museum', city: 'Allentown', state: 'PA' } },
];

// The title wins over the text, which can name other places ("COVEN - Easton, PA").
export const findVenue = (title: string, text: string): ScrapedVenue | null => {
	for (const haystack of [title, text]) {
		const rule = VENUE_RULES.find(({ pattern }) => pattern.test(haystack));
		if (rule) return rule.venue;
	}
	return null;
};

// Squarespace blocks carry their own <style> rules, which would otherwise end up in the text,
// and adjacent blocks would run together without a space between them.
const textFromHtml = (html: string | null | undefined): string => {
	if (!html) return '';
	const $ = cheerio.load(html);
	$('style, script').remove();
	$('p, div, li, h1, h2, h3, h4, h5, h6, br').after(' ');
	return $.root().text().replace(/\s+/g, ' ').trim();
};

export const createDjBradScottAdapter = (): SourceAdapter => {
	// The listing already holds every detail, so fetchDetail answers from here instead of requesting each event page.
	const detailsByUrl = new Map<string, EventDetail>();

	return {
		fetchListing: async (getHtml) => {
			const { pagination, upcoming } = eventsSchema.parse(JSON.parse(await getHtml(EVENTS_URL)));
			if (upcoming.length >= pagination.pageSize) {
				throw new Error(`djbradscott: ${upcoming.length} upcoming events returned, the listing needs pagination`);
			}

			detailsByUrl.clear();
			const items: ListingItem[] = [];

			for (const event of upcoming) {
				const sourceUrl = new URL(event.fullUrl, ORIGIN).href;
				const rawTitle = event.title.trim();
				const text = textFromHtml(event.body);

				items.push({ sourceUrl, rawTitle, startsAt: new Date(event.startDate) });
				detailsByUrl.set(sourceUrl, {
					startsAt: null,
					imageUrl: event.assetUrl ?? null,
					description: text ? trimDescription(text) : null,
					venue: findVenue(rawTitle, text),
				});
			}
			return items;
		},

		fetchDetail: async (url) => {
			const detail = detailsByUrl.get(url);
			if (!detail) throw new Error(`djbradscott: no listing data for ${url}`);
			return detail;
		},
	};
};

export const djBradScottAdapter = createDjBradScottAdapter();
