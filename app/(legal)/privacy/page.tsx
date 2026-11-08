import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Privacy Policy - Lehigh Valley Art & Music',
	description: 'How Lehigh Valley Art & Music handles your data.',
};

export default function PrivacyPolicy() {
	return (
		<>
			<h1 className="text-2xl font-bold">Privacy Policy</h1>
			<p>
				This site is run by a guy in Whitehall who has no interest in selling your data. With that
				said, this is a public website, and the Internet is overrun with bad actors. There&apos;s
				always a chance your data will leak out. Fortunately we don&apos;t store a lot of personal
				data. Just your name, email and your Google avatar, if you have one, but that&apos;s all
				mostly public anyway.
			</p>
			<p>
				You can delete your account and everything you&apos;ve posted at any time. See{' '}
				<Link href="/delete-account" className="text-lvartsmusic-accent underline">
					how to delete your account
				</Link>
				.
			</p>
		</>
	);
}
