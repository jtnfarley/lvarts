import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Privacy Policy - Lehigh Valley Art & Music',
	description: 'How Lehigh Valley Art & Music handles your data.',
};

const CONTACT_EMAIL = 'admin@lvartsandmusic.com';

export default function PrivacyPolicy() {
	return (
		<>
			<h1 className="text-2xl font-bold">Privacy Policy</h1>
			<p>Last updated: November 8, 2026</p>
			<p>
				Lehigh Valley Art &amp; Music (&quot;we&quot;, &quot;us&quot;) runs the website at
				www.lvartandmusic.com and the Lehigh Valley Art &amp; Music Android app, which displays that
				website (together, the &quot;Service&quot;). We are based in Pennsylvania, United States. This
				policy explains what we collect, why, who handles it, and how you can delete it. We do not sell
				your data.
			</p>

			<h2 className="text-xl font-bold">What we collect</h2>
			<ul className="list-disc space-y-2 pl-6">
				<li>
					<strong>Account information.</strong> Your name, email address, and your Google profile
					picture if you sign in with Google. You choose a handle and may add a bio and avatar.
				</li>
				<li>
					<strong>Content you post.</strong> Posts, comments, photos, audio, events, likes and follows.
					Posts are public unless you mark them private, and public content can be seen by anyone and
					copied outside the Service.
				</li>
				<li>
					<strong>Photos and files.</strong> Only files you choose to upload. The app asks for access to
					your photos or files when you pick one, and you can revoke that in your device settings.
				</li>
				<li>
					<strong>Push notification token.</strong> If you allow notifications in the app, we store a
					device token so we can tell you when someone likes, comments on or mentions you. You can turn
					notifications off in your device settings.
				</li>
				<li>
					<strong>Reports.</strong> If you report a post or user, we keep the report and your account
					so an administrator can review it.
				</li>
				<li>
					<strong>Support chat.</strong> Messages you send to the in-app support assistant. The
					conversation is held in your browser and is not saved on our servers, but it is sent to the AI
					provider below to produce a reply. If the assistant flags a bug or a question it cannot
					answer, the conversation is emailed to our administrator.
				</li>
				<li>
					<strong>Usage data.</strong> Your IP address, browser and device type, and the pages you
					visit, collected automatically through server logs and Google Analytics.
				</li>
				<li>
					<strong>Payments.</strong> If you buy a post boost, payment is handled by Stripe. We receive a
					confirmation and the amount, never your card number.
				</li>
			</ul>

			<h2 className="text-xl font-bold">How we use it</h2>
			<ul className="list-disc space-y-2 pl-6">
				<li>To run the Service: sign you in, show your profile and posts, and deliver notifications.</li>
				<li>To send sign-in links and service emails, such as security and support messages.</li>
				<li>To moderate content and respond to reports.</li>
				<li>To understand how the Service is used and fix problems.</li>
				<li>To comply with the law and protect the Service and its users.</li>
			</ul>

			<h2 className="text-xl font-bold">Who handles your data</h2>
			<p>We share data only with the service providers that help us run the Service:</p>
			<ul className="list-disc space-y-2 pl-6">
				<li>Vercel and Prisma: website hosting and our database.</li>
				<li>BunnyCDN and Cloudflare: storage and delivery of uploaded photos and audio.</li>
				<li>Google: sign-in, Google Analytics, and Google Maps for event locations.</li>
				<li>Expo and Google Firebase Cloud Messaging: delivery of push notifications.</li>
				<li>AzuraCast: the online radio station that plays audio posts.</li>
				<li>Anthropic and OpenAI: AI features. The text of a post you choose to rewrite, your support
					chat messages, and the text of a post that mentions one of our AI persona accounts is sent to
					Anthropic or OpenAI to generate a response.</li>
				<li>Stripe: payments for post boosts.</li>
				<li>Our email provider: sign-in links and administrator alerts.</li>
			</ul>
			<p>
				We may also disclose information when the law requires it, to protect people&apos;s safety or
				our rights, or as part of a sale or transfer of the Service, in which case we will give notice.
			</p>

			<h2 className="text-xl font-bold">Cookies</h2>
			<p>
				We use a session cookie to keep you signed in, which is essential to the Service. Google
				Analytics sets cookies to measure how the Service is used. You can block or delete cookies in
				your browser settings, but you will not be able to stay signed in without the essential one.
			</p>

			<h2 className="text-xl font-bold">Retention and deleting your data</h2>
			<p>
				We keep your data while your account is open. You can delete your account at any time, which
				permanently removes your profile, your posts and comments, the comments others made on your
				posts, your uploaded files, and your notification tokens. See{' '}
				<Link href="/delete-account" className="text-lvartsmusic-accent underline">
					how to delete your account
				</Link>
				. Server logs and analytics data are kept by those providers under their own schedules, and
				residual copies may remain in backups for a limited time. If you cannot sign in, email us at the
				address below and we will delete the account for you.
			</p>

			<h2 className="text-xl font-bold">Security</h2>
			<p>
				We use reasonable measures to protect your data, but no method of transmission or storage is
				completely secure, and we cannot guarantee absolute security.
			</p>

			<h2 className="text-xl font-bold">Children</h2>
			<p>
				The Service is not directed to anyone under 16, and we do not knowingly collect personal
				information from them. If you believe a child has given us information, contact us and we will
				remove it.
			</p>

			<h2 className="text-xl font-bold">International users</h2>
			<p>
				Our providers may process data in the United States and other countries whose data protection
				laws differ from yours. By using the Service you understand your information may be transferred
				there.
			</p>

			<h2 className="text-xl font-bold">Links to other sites</h2>
			<p>
				The Service may link to sites we do not operate. We are not responsible for their content or
				privacy practices.
			</p>

			<h2 className="text-xl font-bold">Changes to this policy</h2>
			<p>
				We may update this policy. We will post the new version here and change the date at the top.
				Material changes will also be announced on the Service.
			</p>

			<h2 className="text-xl font-bold">Contact us</h2>
			<p>
				Questions or requests about your data:{' '}
				<a href={`mailto:${CONTACT_EMAIL}`} className="text-lvartsmusic-accent underline">
					{CONTACT_EMAIL}
				</a>
			</p>
		</>
	);
}
