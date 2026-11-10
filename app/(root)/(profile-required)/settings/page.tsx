import type { Metadata } from 'next';
import Link from 'next/link';
import { currentUser } from '@/app/data/currentUser';
import BlockedUsers from '@/components/forms/BlockedUsers';
import NotificationSettingsForm from '@/components/forms/NotificationSettingsForm';
import { getBlockedUsers } from '@/lib/blocks';
import { getNotificationSettings } from '@/lib/notificationSettings';

export const metadata: Metadata = {
	title: 'Settings - Lehigh Valley Art & Music',
	description: 'Your account settings',
};

export default async function Settings() {
	const user = await currentUser();
	if (!user.userdetails) return null;

	const [blockedUsers, notificationSettings] = await Promise.all([
		getBlockedUsers(user.userdetails.id),
		getNotificationSettings(user.userdetails.id),
	]);

	return (
		<div className="rounded-box lvartsmusic-card p-3 md:p-5">
			<h1 className="text-2xl font-bold">Settings</h1>
			<section className="mt-6">
				<h2 className="text-lg font-semibold">Push notifications</h2>
				<p className="mt-1 text-sm text-lvartsmusic-muted">
					Choose which activity sends a push to the mobile app. Your notifications list on the site
					always shows everything.
				</p>
				<NotificationSettingsForm settings={notificationSettings} />
			</section>
			<section className="mt-8">
				<h2 className="text-lg font-semibold">Blocked users</h2>
				<p className="mt-1 text-sm text-lvartsmusic-muted">
					You don&apos;t see posts or notifications from people you block, and they can&apos;t follow you.
				</p>
				<BlockedUsers users={blockedUsers} />
			</section>
			<section className="mt-8">
				<h2 className="text-lg font-semibold">Account</h2>
				{user.email && (
					<p className="mt-1 text-sm text-lvartsmusic-muted">
						Signed in as <span className="font-semibold">{user.email}</span>
					</p>
				)}
				<p className="mt-1 text-sm">
					<Link href="/profile" className="text-lvartsmusic-accent underline">
						Edit your profile or delete your account
					</Link>
				</p>
			</section>
		</div>
	);
}
