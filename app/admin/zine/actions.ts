'use server'

import { revalidatePath } from 'next/cache';
import { notFound } from 'next/navigation';
import { isAdmin } from '@/lib/auth/isAdmin';
import { approveZinePost, rejectZinePost } from '@/lib/zine/review';

const requireAdmin = async (): Promise<void> => {
	if (!(await isAdmin())) notFound();
};

export async function approveZine(postId: number): Promise<void> {
	await requireAdmin();
	await approveZinePost(postId);
	revalidatePath('/admin/zine');
	revalidatePath('/zine');
}

export async function rejectZine(postId: number): Promise<void> {
	await requireAdmin();
	await rejectZinePost(postId);
	revalidatePath('/admin/zine');
}
