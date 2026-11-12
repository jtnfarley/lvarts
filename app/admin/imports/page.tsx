import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isAdmin } from '@/lib/auth/isAdmin';
import { formatDateLine, stripHtml } from '@/lib/cards/text';
import { isLehighValleyCity } from '@/lib/importer/region';
import { getReviewData, type PendingImport, type UnresolvedVenue, type VenueOption } from '@/lib/importer/review';
import { createVenueForGroup, publishAllNew, publishImport, rejectImport, assignExistingVenue } from './actions';

export const dynamic = 'force-dynamic';
// Resolving a venue also runs the import, which downloads each new event's image.
export const maxDuration = 60;

// Paragraphs of the post as plain text, so scraped content is never rendered as HTML here.
const contentLines = (content: string): string[] =>
	content
		.split('</p>')
		.map((paragraph) => stripHtml(paragraph))
		.filter(Boolean);

const fieldClass = 'rounded border px-2 py-1 text-sm';

function UnresolvedVenueCard({ group, venueOptions }: { group: UnresolvedVenue; venueOptions: VenueOption[] }) {
	const found = group.venue;

	return (
		<li className="flex flex-col gap-4 rounded border bg-white p-4">
			<div>
				<h3 className="text-lg font-medium">{group.label}</h3>
				<ul className="list-disc pl-5 text-sm opacity-80">
					{group.events.map((event) => (
						<li key={event.sourceUrl + event.startsAt}>
							{formatDateLine(new Date(event.startsAt))} — {event.headline}{' '}
							<a href={event.sourceUrl} target="_blank" rel="noreferrer" className="link">
								Source page
							</a>
						</li>
					))}
				</ul>
			</div>

			<form action={assignExistingVenue.bind(null, group.sourceKey, group.lookupKey)} className="flex flex-wrap items-center gap-2">
				<select name="venueId" required defaultValue="" className={fieldClass} aria-label="Existing venue">
					<option value="" disabled>
						Choose an existing venue
					</option>
					{venueOptions.map((venue) => (
						<option key={venue.id} value={venue.id}>
							{venue.name}
							{venue.city && ` — ${venue.city}`}
						</option>
					))}
				</select>
				<button type="submit" className="rounded border px-3 py-1.5 text-sm">
					Use this venue
				</button>
			</form>

			<form action={createVenueForGroup.bind(null, group.sourceKey, group.lookupKey)} className="flex flex-col gap-2">
				<p className="text-sm font-medium">Or create a new venue</p>
				<div className="flex flex-wrap gap-2">
					<input name="name" required placeholder="Name" defaultValue={found?.name ?? ''} className={fieldClass} aria-label="Venue name" />
					<input name="address" placeholder="Address" defaultValue={found?.address ?? ''} className={fieldClass} aria-label="Address" />
					<input name="city" required placeholder="City" defaultValue={found?.city ?? ''} className={fieldClass} aria-label="City" />
					<input
						name="state"
						required
						minLength={2}
						maxLength={2}
						placeholder="State"
						defaultValue={found?.state ?? 'PA'}
						className={`${fieldClass} w-16`}
						aria-label="State"
					/>
					<input name="zip" placeholder="Zip" defaultValue={found?.zip ?? ''} className={`${fieldClass} w-24`} aria-label="Zip code" />
				</div>
				<div>
					<button type="submit" className="rounded border px-3 py-1.5 text-sm">
						Create venue and use it
					</button>
				</div>
			</form>
		</li>
	);
}

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
					{item.venueCity && !isLehighValleyCity(item.venueCity) && (
						<span className="rounded bg-red-500/20 px-2 py-0.5 text-xs text-red-600">Outside Lehigh Valley</span>
					)}
				</div>
				<div className="text-sm">
					{formatDateLine(item.eventDate)}
					{item.venueName && ` · ${item.venueName}`}
					{item.venueName && item.venueCity && `, ${item.venueCity}`}
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

	const { unresolvedVenues, venueOptions, pending, missing, notes } = await getReviewData();
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

			{unresolvedVenues.length > 0 && (
				<section className="flex flex-col gap-3">
					<h2 className="text-xl">Needs a venue ({unresolvedVenues.length})</h2>
					<p className="text-sm opacity-70">
						These events aren&apos;t imported yet because their venue isn&apos;t known. Your answer is remembered for next time.
					</p>
					<ul className="flex flex-col gap-4">
						{unresolvedVenues.map((group) => (
							<UnresolvedVenueCard key={`${group.sourceKey}|${group.lookupKey}`} group={group} venueOptions={venueOptions} />
						))}
					</ul>
				</section>
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
