'use server'

import { revalidatePath } from 'next/cache';
import { notFound } from 'next/navigation';
import { prisma } from '@/prisma';
import { isAdmin } from '@/lib/auth/isAdmin';
import { getCalendarAccount, REJECTED_POST_TYPE } from '@/lib/importer/db';
import { getReviewData } from '@/lib/importer/review';

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
