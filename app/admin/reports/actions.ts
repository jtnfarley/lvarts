'use server'

import { revalidatePath } from 'next/cache';
import { notFound } from 'next/navigation';
import { after } from 'next/server';
import { auth } from '@/auth';
import { deletePost } from '@/app/data/posts';
import { prisma } from '@/prisma';
import { deleteAccountData, removeExternalFiles } from '@/lib/accountDeletion';
import { isAdmin, isAdminEmail } from '@/lib/auth/isAdmin';

const requireAdmin = async () => {
	if (!(await isAdmin())) notFound();
};

const getReport = async (reportId: number) => {
	const report = await prisma.reports.findUnique({ where: { id: reportId } });
	if (!report) throw new Error(`Report ${reportId} not found`);
	return report;
};

export async function closeReport(reportId: number, status: 'resolved' | 'dismissed'): Promise<void> {
	await requireAdmin();
	await prisma.reports.updateMany({
		where: { id: reportId, status: 'open' },
		data: { status, resolvedat: new Date() },
	});
	revalidatePath('/admin/reports');
}

// Removing the post also removes the report about it (the foreign key cascades).
export async function deleteReportedPost(reportId: number): Promise<void> {
	await requireAdmin();
	const { postid } = await getReport(reportId);
	if (postid === null) throw new Error('This report is not about a post');

	await deletePost(postid);
	revalidatePath('/admin/reports');
}

// Permanently removes the reported user and everything they posted, like self-service
// account deletion. Never allowed on an admin account.
export async function deleteReportedUser(reportId: number): Promise<void> {
	await requireAdmin();
	const { reporteduserdetailsid } = await getReport(reportId);
	if (reporteduserdetailsid === null) throw new Error('This report is not about a user');

	const target = await prisma.userdetails.findUnique({
		where: { id: reporteduserdetailsid },
		select: { userid: true, User: { select: { email: true } } },
	});
	if (!target) throw new Error('That user no longer exists');
	if (isAdminEmail(target.User.email)) throw new Error('Admin accounts cannot be deleted from reports');

	const session = await auth();
	if (Number(session?.user?.id) === target.userid) throw new Error('You cannot delete your own account here');

	const cleanup = await deleteAccountData(target.userid);
	after(() => removeExternalFiles(cleanup));
	revalidatePath('/admin/reports');
}
