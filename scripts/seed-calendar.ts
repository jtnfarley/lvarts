import { prisma } from '@/prisma';
import { CALENDAR_EMAIL, REJECTED_POST_TYPE } from '@/lib/importer/db';

// Creates the calendar account, the Godfrey Daniels venue details, and the rejected post type.
// Safe to run more than once: it only adds what is missing.
// Usage: npm run seed:calendar

const DISPLAY_NAME = 'LV Art & Music Calendar';
const HANDLE = 'lvartmusic_calendar';
const USERDIR = 'lvcalendar';

const VENUE = { name: 'Godfrey Daniels', address: '7 E. 4th St', city: 'Bethlehem', state: 'PA', zip: '18015' };

const ensureAccount = async (): Promise<void> => {
	const existing = await prisma.user.findUnique({ where: { email: CALENDAR_EMAIL }, include: { userdetails: true } });
	if (existing?.userdetails) {
		console.log(`calendar account exists (userdetails ${existing.userdetails.id})`);
		return;
	}

	const now = new Date();
	// The account never signs in: it has no sessions or login providers.
	const user = existing ?? (await prisma.user.create({ data: { email: CALENDAR_EMAIL, name: DISPLAY_NAME } }));
	const details = await prisma.userdetails.create({
		data: { userid: user.id, displayname: DISPLAY_NAME, handle: HANDLE, userdir: USERDIR, createdat: now, updatedat: now },
	});
	console.log(`created calendar account (userdetails ${details.id})`);
};

const ensureVenue = async (): Promise<void> => {
	const city = (await prisma.cities.findFirst({ where: { city: VENUE.city } })) ?? (await prisma.cities.create({ data: { city: VENUE.city } }));
	const zip = (await prisma.zipcodes.findFirst({ where: { zipcode: VENUE.zip } })) ?? (await prisma.zipcodes.create({ data: { zipcode: VENUE.zip } }));
	const state = (await prisma.states.findFirst({ where: { stateabbr: VENUE.state } })) ?? (await prisma.states.create({ data: { stateabbr: VENUE.state, statefullname: 'Pennsylvania' } }));

	const venue = await prisma.venues.findFirst({ where: { venuename: VENUE.name } });
	if (!venue) {
		await prisma.venues.create({
			data: { venuename: VENUE.name, address: VENUE.address, cityid: city.id, stateid: state.id, zipcodeid: zip.id },
		});
		console.log('created venue');
		return;
	}

	// An existing venue keeps its name and address; only empty location fields are filled in.
	await prisma.venues.update({
		where: { id: venue.id },
		data: { cityid: venue.cityid ?? city.id, stateid: venue.stateid ?? state.id, zipcodeid: venue.zipcodeid ?? zip.id },
	});
	console.log(`venue exists (id ${venue.id}), filled in any missing city, state and zip`);
};

const ensureRejectedPostType = async (): Promise<void> => {
	const existing = await prisma.posttypes.findFirst({ where: { posttype: REJECTED_POST_TYPE } });
	if (existing) return console.log('rejected post type exists');
	await prisma.posttypes.create({ data: { posttype: REJECTED_POST_TYPE } });
	console.log('created rejected post type');
};

const main = async (): Promise<void> => {
	await ensureAccount();
	await ensureVenue();
	await ensureRejectedPostType();
};

main()
	.catch((error: unknown) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(() => prisma.$disconnect());
