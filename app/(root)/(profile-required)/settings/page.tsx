import type { Metadata } from 'next';
import { currentUser } from '@/app/data/currentUser';
import BlockedUsers from '@/components/forms/BlockedUsers';
import { getBlockedUsers } from '@/lib/blocks';

export const metadata: Metadata = {
	title: 'Settings - Lehigh Valley Art & Music',
	description: 'Your account settings',
};

export default async function Settings() {
	const user = await currentUser();
	if (!user.userdetails) return null;

	const blockedUsers = await getBlockedUsers(user.userdetails.id);

	return (
		<div className="rounded-box lvartsmusic-card p-3 md:p-5">
			<h1 className="text-2xl font-bold">Settings</h1>
			<section className="mt-6">
				<h2 className="text-lg font-semibold">Blocked users</h2>
				<p className="mt-1 text-sm text-lvartsmusic-muted">
					You don&apos;t see posts or notifications from people you block, and they can&apos;t follow you.
				</p>
				<BlockedUsers users={blockedUsers} />
			</section>
		</div>
	);
}
