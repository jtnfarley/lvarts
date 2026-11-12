import { prisma } from '@/prisma';
import { CALENDAR_EMAIL, REJECTED_POST_TYPE } from '@/lib/importer/db';
import { ensureVenue } from '@/lib/importer/venueRecords';

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

const seedVenue = async (): Promise<void> => {
	const { id, created } = await ensureVenue({ ...VENUE, stateName: 'Pennsylvania' });
	console.log(created ? 'created venue' : `venue exists (id ${id}), filled in any missing city, state and zip`);
};

const ensureRejectedPostType = async (): Promise<void> => {
	const existing = await prisma.posttypes.findFirst({ where: { posttype: REJECTED_POST_TYPE } });
	if (existing) return console.log('rejected post type exists');
	await prisma.posttypes.create({ data: { posttype: REJECTED_POST_TYPE } });
	console.log('created rejected post type');
};

const main = async (): Promise<void> => {
	await ensureAccount();
	await seedVenue();
	await ensureRejectedPostType();
};

main()
	.catch((error: unknown) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(() => prisma.$disconnect());
