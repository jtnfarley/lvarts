import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Delete Your Account - Lehigh Valley Art & Music',
	description: 'How to permanently delete your Lehigh Valley Art & Music account and data.',
};

export default function DeleteAccountInfo() {
	return (
		<>
			<h1 className="text-2xl font-bold">Delete your account</h1>
			<p>You can permanently delete your account yourself, from the website or the mobile app:</p>
			<ol className="list-decimal ps-6 flex flex-col gap-1">
				<li>
					<Link href="/" className="text-lvartsmusic-accent underline">
						Sign in
					</Link>{' '}
					with the email address or Google account you used to join. If you can&apos;t get into
					your Google account, request a sign-in link to your email address instead.
				</li>
				<li>Open your Profile.</li>
				<li>Scroll to the bottom and choose &ldquo;Delete my account&rdquo;.</li>
				<li>Type DELETE to confirm.</li>
			</ol>
			<h2 className="mt-2 text-lg font-semibold">What gets deleted</h2>
			<ul className="list-disc ps-6 flex flex-col gap-1">
				<li>Your profile, name, email address, avatar, handle and bio.</li>
				<li>All of your posts and comments, including audio, images and events you posted.</li>
				<li>Every comment other people left on your posts.</li>
				<li>Your likes, follows, notifications and push notification registrations.</li>
				<li>Files you uploaded.</li>
			</ul>
			<p>Deletion happens immediately and cannot be undone.</p>
		</>
	);
}
