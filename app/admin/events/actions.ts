'use server'

import { revalidatePath } from 'next/cache';
import { rejectImport } from '../imports/actions';

// "Delete" rejects the post: it is hidden but kept, so the importer's duplicate check
// still sees it and the next scrape does not bring the event back.
export async function removeCalendarEvent(postId: number): Promise<void> {
	await rejectImport(postId);
	revalidatePath('/admin/events');
}
