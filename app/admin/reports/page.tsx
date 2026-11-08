import Link from 'next/link';
import { stripHtml, truncate } from '@/lib/cards/text';
import { REPORT_REASONS } from '@/lib/reports';
import { closeReport, deleteReportedPost, deleteReportedUser } from './actions';
import { getReports, type AdminReport } from './data';

export const dynamic = 'force-dynamic';

const PREVIEW_LENGTH = 400;

const reasonLabel = (reason: string): string => (REPORT_REASONS as Record<string, string>)[reason] ?? reason;

const personLabel = (person: { handle: string | null; displayname: string | null }): string =>
	person.handle ? `@${person.handle}` : (person.displayname ?? 'unknown user');

function Target({ report }: { report: AdminReport }) {
	if (report.posts) {
		const author = report.posts.usertoposts[0]?.userdetails;
		return (
			<div className="flex flex-col gap-1 rounded border bg-neutral-50 p-3 text-sm">
				<div>
					<strong>{report.posts.posttypes.posttype === 'comment' ? 'Comment' : 'Post'}</strong>
					{author && ` by ${personLabel(author)}`} ·{' '}
					<Link href={`/post/${report.posts.id}`} target="_blank" className="link">
						Open
					</Link>
				</div>
				{/* Plain text only: reported content is never rendered as HTML in the admin area. */}
				<p className="whitespace-pre-wrap">{truncate(stripHtml(report.posts.content ?? ''), PREVIEW_LENGTH) || '(no text)'}</p>
			</div>
		);
	}

	if (report.reporteduser) {
		return (
			<div className="rounded border bg-neutral-50 p-3 text-sm">
				<strong>Profile</strong> {personLabel(report.reporteduser)} ·{' '}
				{report.reporteduser.handle && (
					<Link href={`/user/${report.reporteduser.handle}`} target="_blank" className="link">
						Open
					</Link>
				)}
			</div>
		);
	}

	return <div className="rounded border bg-neutral-50 p-3 text-sm">The reported content has been removed.</div>;
}

function OpenReport({ report }: { report: AdminReport }) {
	return (
		<li className="flex flex-col gap-3 rounded border bg-white p-4">
			<div className="flex flex-wrap items-center gap-2 text-sm">
				<span className="rounded bg-amber-500/20 px-2 py-0.5 text-amber-700">{reasonLabel(report.reason)}</span>
				<span className="opacity-70">
					reported by {personLabel(report.reporter)} · {report.createdat.toLocaleString('en-US', { timeZone: 'America/New_York' })}
				</span>
			</div>
			{report.details && <p className="text-sm whitespace-pre-wrap">&ldquo;{report.details}&rdquo;</p>}
			<Target report={report} />
			<div className="flex flex-wrap items-center gap-2">
				<form action={closeReport.bind(null, report.id, 'dismissed')}>
					<button type="submit" className="rounded border px-3 py-1.5 text-sm">
						Dismiss
					</button>
				</form>
				<form action={closeReport.bind(null, report.id, 'resolved')}>
					<button type="submit" className="rounded border px-3 py-1.5 text-sm">
						Mark resolved
					</button>
				</form>
				{report.posts && (
					<form action={deleteReportedPost.bind(null, report.id)}>
						<button type="submit" className="rounded border border-red-600 px-3 py-1.5 text-sm text-red-700">
							Delete post
						</button>
					</form>
				)}
				{report.reporteduser && (
					<form action={deleteReportedUser.bind(null, report.id)} className="flex items-center gap-2">
						<label className="flex items-center gap-1 text-sm">
							<input type="checkbox" required /> Permanently delete this account and its content
						</label>
						<button type="submit" className="rounded border border-red-600 px-3 py-1.5 text-sm text-red-700">
							Delete account
						</button>
					</form>
				)}
			</div>
		</li>
	);
}

export default async function ReportsPage() {
	const [open, closed] = await Promise.all([getReports('open'), getReports('closed')]);

	return (
		<div className="mx-auto flex max-w-5xl flex-col gap-6 p-5">
			<h1 className="text-2xl">Reports</h1>

			<section className="flex flex-col gap-3">
				<h2 className="text-lg font-medium">Open ({open.length})</h2>
				{open.length === 0 ? (
					<p className="text-sm opacity-70">Nothing to review.</p>
				) : (
					<ul className="flex flex-col gap-3">
						{open.map((report) => (
							<OpenReport key={report.id} report={report} />
						))}
					</ul>
				)}
			</section>

			<section className="flex flex-col gap-3">
				<h2 className="text-lg font-medium">Recently closed</h2>
				{closed.length === 0 ? (
					<p className="text-sm opacity-70">None yet.</p>
				) : (
					<ul className="flex flex-col gap-2 text-sm">
						{closed.map((report) => (
							<li key={report.id} className="rounded border bg-white p-3">
								<span className="font-medium">{report.status}</span> · {reasonLabel(report.reason)} ·{' '}
								{report.posts ? `post ${report.posts.id}` : report.reporteduser ? personLabel(report.reporteduser) : 'content removed'}
							</li>
						))}
					</ul>
				)}
			</section>
		</div>
	);
}
