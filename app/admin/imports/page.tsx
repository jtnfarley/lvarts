import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isAdmin } from '@/lib/auth/isAdmin';
import { formatDateLine, stripHtml } from '@/lib/cards/text';
import { getReviewData, type PendingImport } from '@/lib/importer/review';
import { publishAllNew, publishImport, rejectImport } from './actions';

export const dynamic = 'force-dynamic';

// Paragraphs of the post as plain text, so scraped content is never rendered as HTML here.
const contentLines = (content: string): string[] =>
	content
		.split('</p>')
		.map((paragraph) => stripHtml(paragraph))
		.filter(Boolean);

function PendingCard({ item }: { item: PendingImport }) {
	return (
		<li className="flex flex-col gap-4 rounded border bg-white p-4 sm:flex-row">
			{/* eslint-disable-next-line @next/next/no-img-element -- generated JPEG, not optimizable */}
			<img src={`/api/cards/event/${item.eventId}?preview=1`} alt="" width={240} height={300} className="h-fit rounded border" />
			<div className="flex flex-1 flex-col gap-2">
				<div className="flex flex-wrap items-center gap-2">
					<h2 className="text-lg font-medium">{item.eventName}</h2>
					<span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs text-amber-600">{item.reason}</span>
					{!item.hasImage && <span className="rounded bg-red-500/20 px-2 py-0.5 text-xs text-red-600">No image</span>}
				</div>
				<div className="text-sm">
					{formatDateLine(item.eventDate)}
					{item.venueName && ` · ${item.venueName}`}
				</div>
				<div className="flex flex-col gap-1 text-sm opacity-80">
					{contentLines(item.content).map((line) => (
						<p key={line}>{line}</p>
					))}
				</div>
				{item.sourceUrl && (
					<a href={item.sourceUrl} target="_blank" rel="noreferrer" className="link text-sm">
						Source page
					</a>
				)}
				<div className="mt-2 flex flex-wrap gap-2">
					{item.reason !== 'Canceled at source' && (
						<form action={publishImport.bind(null, item.postId)}>
							<button type="submit" className="rounded border px-3 py-1.5 text-sm">
								Publish
							</button>
						</form>
					)}
					<form action={rejectImport.bind(null, item.postId)}>
						<button type="submit" className="rounded border px-3 py-1.5 text-sm">
							Reject
						</button>
					</form>
					<Link href={`/edit-post/${item.postId}`} className="rounded border px-3 py-1.5 text-sm">
						Edit
					</Link>
				</div>
			</div>
		</li>
	);
}

export default async function ImportsPage() {
	if (!(await isAdmin())) notFound();

	const { pending, missing, notes } = await getReviewData();
	const newCount = pending.filter((item) => item.reason === 'New').length;

	return (
		<div className="mx-auto flex max-w-5xl flex-col gap-6 p-5">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl">Event imports</h1>
				{newCount > 0 && (
					<form action={publishAllNew}>
						<button type="submit" className="rounded border px-3 py-1.5 text-sm">
							Publish all new ({newCount})
						</button>
					</form>
				)}
			</div>

			{notes.length > 0 && (
				<ul className="list-disc pl-5 text-sm text-red-600">
					{notes.map((note) => (
						<li key={note}>{note}</li>
					))}
				</ul>
			)}

			<section className="flex flex-col gap-3">
				<h2 className="text-xl">Waiting for review ({pending.length})</h2>
				{pending.length === 0 ? <p className="text-sm">Nothing is waiting for review.</p> : null}
				<ul className="flex flex-col gap-4">
					{pending.map((item) => (
						<PendingCard key={item.postId} item={item} />
					))}
				</ul>
			</section>

			<section className="flex flex-col gap-3">
				<h2 className="text-xl">Missing from source ({missing.length})</h2>
				<p className="text-sm opacity-70">
					Published future events that the venue&apos;s listing no longer shows. Nothing was changed; check the venue&apos;s page.
				</p>
				<ul className="list-disc pl-5 text-sm">
					{missing.map((item) => (
						<li key={item.postId}>
							{formatDateLine(item.eventDate)} — {item.eventName}{' '}
							<a href={item.sourceUrl} target="_blank" rel="noreferrer" className="link">
								Source page
							</a>{' '}
							·{' '}
							<Link href={`/edit-post/${item.postId}`} className="link">
								Edit
							</Link>
						</li>
					))}
				</ul>
			</section>
		</div>
	);
}
