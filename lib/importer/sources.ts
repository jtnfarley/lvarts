export type ImportSource = {
	// Key of the source in the scraper's registry.
	scraperKey: string;
	venueName: string;
	// New posts are published right away instead of waiting for review.
	autoPublish: boolean;
};

export const IMPORT_SOURCES: ImportSource[] = [
	{ scraperKey: 'godfrey', venueName: 'Godfrey Daniels', autoPublish: false },
	{ scraperKey: 'inkwell', venueName: 'Inkwell.', autoPublish: false },
];

// IMPORT_AUTO_PUBLISH=off is a kill switch that overrides every source without a deploy.
export const shouldAutoPublish = (source: ImportSource): boolean =>
	source.autoPublish && process.env.IMPORT_AUTO_PUBLISH !== 'off';
