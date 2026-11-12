'use server'

import { revalidatePath } from 'next/cache';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { prisma } from '@/prisma';
import { isAdmin } from '@/lib/auth/isAdmin';
import { getCalendarAccount, REJECTED_POST_TYPE } from '@/lib/importer/db';
import { runImport } from '@/lib/importer/run';
import { getReviewData } from '@/lib/importer/review';
import { IMPORT_SOURCES } from '@/lib/importer/sources';
import { ensureVenue } from '@/lib/importer/venueRecords';

// Every action only touches posts that belong to the calendar account.
const requireAdminAndAccount = async () => {
	if (!(await isAdmin())) notFound();
	return getCalendarAccount();
};

const ownedBy = (userdetailsid: number) => ({ usertoposts: { some: { userdetailsid } } });

export async function publishImport(postId: number): Promise<void> {
	const account = await requireAdminAndAccount();
	await prisma.posts.updateMany({ where: { id: postId, ...ownedBy(account.id) }, data: { privatepost: false } });
	revalidatePath('/admin/imports');
}

export async function rejectImport(postId: number): Promise<void> {
	const account = await requireAdminAndAccount();
	const rejectedType = await prisma.posttypes.findFirst({ where: { posttype: REJECTED_POST_TYPE } });
	if (!rejectedType) throw new Error(`Post type "${REJECTED_POST_TYPE}" not found. Run scripts/seed-calendar.ts first.`);

	// Rejected posts stay private and keep their event row, so they still count when the importer looks for duplicates.
	await prisma.posts.updateMany({
		where: { id: postId, ...ownedBy(account.id) },
		data: { posttypeid: rejectedType.id, privatepost: true },
	});
	revalidatePath('/admin/imports');
}

export async function publishAllNew(): Promise<void> {
	const account = await requireAdminAndAccount();
	const { pending } = await getReviewData();
	const newIds = pending.filter((item) => item.reason === 'New').map((item) => item.postId);

	await prisma.posts.updateMany({ where: { id: { in: newIds }, ...ownedBy(account.id) }, data: { privatepost: false } });
	revalidatePath('/admin/imports');
}

// A text field that is optional: an empty box counts as not filled in.
const optionalText = z
	.string()
	.trim()
	.max(200)
	.transform((value) => value || undefined);

const newVenueSchema = z.object({
	name: z.string().trim().min(1).max(200),
	address: optionalText,
	city: z.string().trim().min(1).max(100),
	state: z.string().trim().length(2),
	zip: optionalText,
});

const existingVenueSchema = z.object({ venueId: z.coerce.number().int().positive() });

const lookupKeySchema = z.string().min(1).max(300);

// The source and lookup key are bound from the page, so they are checked here like any other input.
const checkGroup = (sourceKey: string, lookupKey: string): void => {
	if (!IMPORT_SOURCES.some((source) => source.scraperKey === sourceKey && source.venue === 'per-event')) {
		throw new Error(`Unknown source: ${sourceKey}`);
	}
	lookupKeySchema.parse(lookupKey);
};

// Remembers the answer for next time, then imports so the events show up for review right away.
const saveAnswerAndImport = async (sourceKey: string, lookupKey: string, venueId: number): Promise<void> => {
	await prisma.importvenuemaps.upsert({
		where: { sourcekey_lookupkey: { sourcekey: sourceKey, lookupkey: lookupKey } },
		create: { sourcekey: sourceKey, lookupkey: lookupKey, venueid: venueId },
		update: { venueid: venueId },
	});
	await runImport({ dryRun: false, sourceKey });
	revalidatePath('/admin/imports');
};

export async function assignExistingVenue(sourceKey: string, lookupKey: string, formData: FormData): Promise<void> {
	await requireAdminAndAccount();
	checkGroup(sourceKey, lookupKey);

	const { venueId } = existingVenueSchema.parse(Object.fromEntries(formData));
	const venue = await prisma.venues.findUnique({ where: { id: venueId }, select: { id: true } });
	if (!venue) throw new Error(`Venue ${venueId} not found`);

	await saveAnswerAndImport(sourceKey, lookupKey, venue.id);
}

export async function createVenueForGroup(sourceKey: string, lookupKey: string, formData: FormData): Promise<void> {
	await requireAdminAndAccount();
	checkGroup(sourceKey, lookupKey);

	const input = newVenueSchema.parse(Object.fromEntries(formData));
	const { id } = await ensureVenue(input);

	await saveAnswerAndImport(sourceKey, lookupKey, id);
}
