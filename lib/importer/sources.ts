type VenueRule =
	// Every event is at one venue, which must already exist.
	| { venue: 'fixed'; venueName: string }
	// Events happen at many venues; each is resolved from what the scraper found (see venues.ts).
	| { venue: 'per-event' };

export type ImportSource = VenueRule & {
	// Key of the source in the scraper's registry.
	scraperKey: string;
	// New posts are published right away instead of waiting for review.
	autoPublish: boolean;
};

export const IMPORT_SOURCES: ImportSource[] = [
	{ scraperKey: 'godfrey', venue: 'fixed', venueName: 'Godfrey Daniels', autoPublish: false },
	{ scraperKey: 'inkwell', venue: 'fixed', venueName: 'Inkwell.', autoPublish: false },
	{ scraperKey: 'djbradscott', venue: 'per-event', autoPublish: false },
];

// IMPORT_AUTO_PUBLISH=off is a kill switch that overrides every source without a deploy.
export const shouldAutoPublish = (source: ImportSource): boolean =>
	source.autoPublish && process.env.IMPORT_AUTO_PUBLISH !== 'off';
