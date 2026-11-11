import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isAdmin } from '@/lib/auth/isAdmin';
import { formatDateLine } from '@/lib/cards/text';
import { getUpcomingCalendarEvents } from '@/lib/importer/events';
import { RemoveEventButton } from './RemoveEventButton';

export const dynamic = 'force-dynamic';

export default async function ManageEventsPage() {
	if (!(await isAdmin())) notFound();

	const events = await getUpcomingCalendarEvents();

	return (
		<div className="mx-auto flex max-w-3xl flex-col gap-4 p-5">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl">Manage events ({events.length})</h1>
				<Link href="/admin/add-event" className="rounded border px-3 py-1.5 text-sm">
					Add event
				</Link>
			</div>
			<p className="text-sm opacity-70">Upcoming events posted by the LV Art &amp; Music Calendar account.</p>

			{events.length === 0 ? <p className="text-sm">No upcoming events.</p> : null}
			<ul className="flex flex-col gap-3">
				{events.map((event) => (
					<li key={event.postId} className="flex flex-wrap items-center justify-between gap-3 rounded border p-3">
						<div className="flex flex-col gap-1">
							<div className="flex flex-wrap items-center gap-2">
								<span className="font-medium">{event.eventName}</span>
								{event.isPrivate && <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs text-amber-600">Pending</span>}
							</div>
							<span className="text-sm opacity-80">
								{formatDateLine(event.eventDate)}
								{event.venueName && ` · ${event.venueName}`}
							</span>
						</div>
						<div className="flex gap-2">
							<Link href={`/edit-post/${event.postId}`} className="rounded border px-3 py-1.5 text-sm">
								Edit
							</Link>
							<RemoveEventButton postId={event.postId} eventName={event.eventName} />
						</div>
					</li>
				))}
			</ul>
		</div>
	);
}
