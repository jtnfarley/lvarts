import { prisma } from '@/prisma';

export type VenueInput = {
	name: string;
	address?: string;
	city: string;
	// Two-letter abbreviation, e.g. "PA".
	state: string;
	// Only used when the state row has to be created.
	stateName?: string;
	zip?: string;
};

type Candidate = { id: number; city: string | null };

const sameText = (a: string, b: string): boolean => a.trim().toLowerCase() === b.trim().toLowerCase();

// Of the venues that already share a name, the one in this city, or else one with no city yet that this can fill in.
// Never the venue of a different city: a same-named place elsewhere is a different venue.
export const pickExistingVenue = (candidates: Candidate[], city: string): Candidate | undefined =>
	candidates.find((candidate) => candidate.city && sameText(candidate.city, city)) ?? candidates.find((candidate) => !candidate.city);

const ensureCity = async (city: string): Promise<number> =>
	(await prisma.cities.findFirst({ where: { city: { equals: city, mode: 'insensitive' } } }))?.id ??
	(await prisma.cities.create({ data: { city } })).id;

const ensureState = async (abbreviation: string, fullName?: string): Promise<number> =>
	(await prisma.states.findFirst({ where: { stateabbr: { equals: abbreviation, mode: 'insensitive' } } }))?.id ??
	(await prisma.states.create({ data: { stateabbr: abbreviation.toUpperCase(), statefullname: fullName } })).id;

const ensureZip = async (zip: string): Promise<number> =>
	(await prisma.zipcodes.findFirst({ where: { zipcode: zip } }))?.id ?? (await prisma.zipcodes.create({ data: { zipcode: zip } })).id;

// Finds the venue or creates it, so an admin or the seed script can run twice without making a duplicate.
// An existing venue keeps its name and address; only its empty city, state and zip are filled in.
export const ensureVenue = async (input: VenueInput): Promise<{ id: number; created: boolean }> => {
	const [cityId, stateId, zipId] = await Promise.all([
		ensureCity(input.city),
		ensureState(input.state, input.stateName),
		input.zip ? ensureZip(input.zip) : Promise.resolve(undefined),
	]);

	const sameName = await prisma.venues.findMany({
		where: { venuename: { equals: input.name, mode: 'insensitive' } },
		select: { id: true, cityid: true, stateid: true, zipcodeid: true, cities: { select: { city: true } } },
	});
	const existing = pickExistingVenue(
		sameName.map((venue) => ({ ...venue, city: venue.cities?.city ?? null })),
		input.city,
	);

	if (!existing) {
		const venue = await prisma.venues.create({
			data: { venuename: input.name, address: input.address, cityid: cityId, stateid: stateId, zipcodeid: zipId },
			select: { id: true },
		});
		return { id: venue.id, created: true };
	}

	const row = sameName.find((venue) => venue.id === existing.id);
	await prisma.venues.update({
		where: { id: existing.id },
		data: { cityid: row?.cityid ?? cityId, stateid: row?.stateid ?? stateId, zipcodeid: row?.zipcodeid ?? zipId },
	});
	return { id: existing.id, created: false };
};
