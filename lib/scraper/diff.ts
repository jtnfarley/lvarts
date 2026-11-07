import type { FieldChange, ScrapedEvent, RunDiff } from './types';

const COMPARED_FIELDS = ['headline', 'startsAt', 'soldOut', 'canceled'] as const;
const DETAIL_FIELDS = ['description', 'imageUrl'] as const;

const changesBetween = (before: ScrapedEvent, after: ScrapedEvent): FieldChange[] => {
	const changes: FieldChange[] = COMPARED_FIELDS.filter((field) => before[field] !== after[field]).map((field) => ({
		field,
		before: before[field],
		after: after[field],
	}));

	// Details that were still pending in the previous run would otherwise show up as changes.
	if (before.detailFetchedAt && after.detailFetchedAt) {
		for (const field of DETAIL_FIELDS) {
			if (before[field] !== after[field]) changes.push({ field, before: before[field], after: after[field] });
		}
	}
	return changes;
};

export const diffSnapshots = (previous: ScrapedEvent[], current: ScrapedEvent[], now: Date = new Date()): RunDiff => {
	const previousByKey = new Map(previous.map((event) => [event.matchKey, event]));
	const currentKeys = new Set(current.map((event) => event.matchKey));
	const diff: RunDiff = { newEvents: [], changed: [], missingPast: [], missingFuture: [] };

	for (const event of current) {
		const before = previousByKey.get(event.matchKey);
		if (!before) {
			diff.newEvents.push(event);
			continue;
		}
		const changes = changesBetween(before, event);
		if (changes.length > 0) diff.changed.push({ matchKey: event.matchKey, headline: event.headline, changes });
	}

	for (const event of previous) {
		if (currentKeys.has(event.matchKey)) continue;
		const isPast = new Date(event.startsAt).getTime() < now.getTime();
		(isPast ? diff.missingPast : diff.missingFuture).push(event);
	}
	return diff;
};
