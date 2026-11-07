import { z } from 'zod';

// Bump when the snapshot shape changes; phase 2 imports consume this format.
export const SCHEMA_VERSION = 1;

export const scrapedEventSchema = z.object({
	sourceKey: z.string(),
	sourceUrl: z.string(),
	matchKey: z.string(),
	startsAt: z.string(),
	rawTitle: z.string(),
	headline: z.string(),
	tagline: z.string().nullable(),
	soldOut: z.boolean(),
	canceled: z.boolean(),
	notices: z.array(z.string()),
	description: z.string().nullable(),
	imageUrl: z.string().nullable(),
	detailFetchedAt: z.string().nullable(),
	warnings: z.array(z.string()),
});
export type ScrapedEvent = z.infer<typeof scrapedEventSchema>;

export const snapshotSchema = z.object({
	schemaVersion: z.number(),
	sourceKey: z.string(),
	startedAt: z.string(),
	finishedAt: z.string(),
	stats: z.object({ requests: z.number(), failedRequests: z.number(), detailsFetched: z.number() }),
	errors: z.array(z.string()),
	events: z.array(scrapedEventSchema),
});
export type Snapshot = z.infer<typeof snapshotSchema>;

export const runDiffSchema = z.object({
	newEvents: z.array(scrapedEventSchema),
	changed: z.array(
		z.object({
			matchKey: z.string(),
			headline: z.string(),
			changes: z.array(z.object({ field: z.string(), before: z.unknown(), after: z.unknown() })),
		}),
	),
	missingPast: z.array(scrapedEventSchema),
	missingFuture: z.array(scrapedEventSchema),
});
export type RunDiff = z.infer<typeof runDiffSchema>;
export type FieldChange = RunDiff['changed'][number]['changes'][number];

export const runIndexEntrySchema = z.object({
	sourceKey: z.string(),
	startedAt: z.string(),
	finishedAt: z.string(),
	snapshotPath: z.string(),
	diffPath: z.string(),
	eventCount: z.number(),
	newCount: z.number(),
	changedCount: z.number(),
	missingCount: z.number(),
	warningCount: z.number(),
	errorCount: z.number(),
	failed: z.boolean(),
});
export type RunIndexEntry = z.infer<typeof runIndexEntrySchema>;

export const runIndexSchema = z.object({ runs: z.array(runIndexEntrySchema) });

export type ListingItem = {
	sourceUrl: string;
	rawTitle: string;
	startsAt: Date;
};

export type EventDetail = {
	startsAt: Date | null;
	imageUrl: string | null;
	description: string | null;
};

export type GetHtml = (url: string) => Promise<string>;

export type SourceAdapter = {
	fetchListing(getHtml: GetHtml): Promise<ListingItem[]>;
	fetchDetail(url: string, getHtml: GetHtml): Promise<EventDetail>;
};
