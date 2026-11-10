'use server'

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { isLoggedIn } from '@/app/data/currentUser';
import { prisma } from '@/prisma';

type SaveResult = { ok: true } | { ok: false; error: string };

const settingsSchema = z.object({
    pushpaused: z.boolean(),
    pushlikes: z.boolean(),
    pushcomments: z.boolean(),
    pushmentions: z.boolean(),
    pushfollows: z.boolean(),
});

// The owner is always the logged-in user; the browser only sends the toggle values.
export const saveNotificationSettings = async (input: unknown): Promise<SaveResult> => {
    const parsed = settingsSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: 'Those settings were not valid.' };

    const userdetailsid = (await isLoggedIn())?.userdetails?.id;
    if (!userdetailsid) return { ok: false, error: 'Please sign in first.' };

    await prisma.notificationsettings.upsert({
        where: { userdetailsid },
        create: { userdetailsid, ...parsed.data },
        update: parsed.data,
    });

    revalidatePath('/settings');
    return { ok: true };
};
