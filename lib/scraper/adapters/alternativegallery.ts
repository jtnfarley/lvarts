import { z } from 'zod';
import type { EventDetail, ListingItem, ScrapedVenue, SourceAdapter } from '../types';
import { textFromHtml } from './djbradscott';
import { trimDescription } from './godfrey';

const ORIGIN = 'https://www.thealternativegallery.com';
// Squarespace serves the event collection as JSON; `upcoming` is every future event, `past` is paged.
const EVENTS_URL = `${ORIGIN}/events?format=json`;

// Squarespace's location field is a default map pin for most events, so the venue is fixed here.
export const GALLERY_VENUE: ScrapedVenue = {
	name: 'The Alternative Gallery',
	address: '707 N 4th St',
	city: 'Allentown',
	state: 'PA',
	zip: '18102',
};

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

// The gallery titles off-site shows "Name @ The Roxy Theater". Only the name is known, so an admin resolves the rest.
export const findVenue = (title: string): ScrapedVenue => {
	const offSiteName = title.match(/\s@\s*(.+)$/)?.[1].trim();
	return offSiteName ? { name: offSiteName } : GALLERY_VENUE;
};

export const createAlternativeGalleryAdapter = (): SourceAdapter => {
	// The listing already holds every detail, so fetchDetail answers from here instead of requesting each event page.
	const detailsByUrl = new Map<string, EventDetail>();

	return {
		detailsInListing: true,

		fetchListing: async (getHtml) => {
			const { pagination, upcoming } = eventsSchema.parse(JSON.parse(await getHtml(EVENTS_URL)));
			if (upcoming.length >= pagination.pageSize) {
				throw new Error(`alternativegallery: ${upcoming.length} upcoming events returned, the listing needs pagination`);
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
					venue: findVenue(rawTitle),
				});
			}
			return items;
		},

		fetchDetail: async (url) => {
			const detail = detailsByUrl.get(url);
			if (!detail) throw new Error(`alternativegallery: no listing data for ${url}`);
			return detail;
		},
	};
};

export const alternativeGalleryAdapter = createAlternativeGalleryAdapter();
