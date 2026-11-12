import type { ScrapedEvent } from '../scraper/types';

// Everything resolveVenueId needs, loaded up front so planning stays a pure function.
export type VenueLookup = {
	// An admin's saved answers for one source, by lookup key.
	mappings: Map<string, number>;
	venues: { id: number; name: string; city: string | null }[];
};

const normalize = (text: string): string => text.replace(/\s+/g, ' ').trim().toLowerCase();

// What an admin's answer is saved against: the venue the scraper found, or the title when it found none,
// so a recurring show at an unrecognized venue only has to be resolved once.
export const venueLookupKey = (event: ScrapedEvent): string => normalize(event.venue?.name ?? event.headline);

// A saved answer wins, then an exact name match. There is deliberately no fuzzy matching:
// attaching an event to the wrong venue is worse than leaving it for an admin to resolve.
export const resolveVenueId = (lookup: VenueLookup, event: ScrapedEvent): number | null => {
	const saved = lookup.mappings.get(venueLookupKey(event));
	if (saved !== undefined) return saved;
	if (!event.venue) return null;

	const name = normalize(event.venue.name);
	const sameName = lookup.venues.filter((venue) => normalize(venue.name) === name);
	if (sameName.length <= 1) return sameName[0]?.id ?? null;

	// Several venues share the name, so only a matching city settles it.
	const city = event.venue.city ? normalize(event.venue.city) : null;
	const inCity = sameName.filter((venue) => venue.city && normalize(venue.city) === city);
	return inCity.length === 1 ? inCity[0].id : null;
};
