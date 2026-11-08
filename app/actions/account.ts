'use server'

import { after } from 'next/server';
import { isLoggedIn } from '@/app/data/currentUser';
import { signOut } from '@/auth';
import { deleteAccountData, removeExternalFiles } from '@/lib/accountDeletion';

export const deleteMyAccount = async (confirmation: string): Promise<void> => {
    if (confirmation !== 'DELETE') {
        throw new Error('Type DELETE to confirm');
    }

    const user = await isLoggedIn();
    if (!user) throw new Error('Not signed in');

    const cleanup = await deleteAccountData(Number(user.id));
    after(() => removeExternalFiles(cleanup));

    await signOut({ redirectTo: '/' });
};
