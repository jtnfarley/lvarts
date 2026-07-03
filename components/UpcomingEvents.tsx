import Link from "next/link";
import { getUpcomingEvents } from "@/app/data/posts";
import { formatDate } from "@/lib/utils";

export default async function UpcomingEvents() {
	const events = await getUpcomingEvents(5);

	if (!events.length) {
		return (
			<div className="px-4 py-3 text-sm text-lvartsmusic-muted">
				No upcoming events yet — be the first to post one.
			</div>
		);
	}

	return (
		<div className="mt-1">
			{events.map((event) => (
				<Link
					key={event.id}
					href={`/post/${event.id}`}
					className="block px-4 py-3 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
				>
					<div className="truncate text-sm font-bold text-lvartsmusic-foreground">{event.eventname}</div>
					<div className="truncate text-xs text-lvartsmusic-muted">{formatDate(event.eventdate)}</div>
					{event.venuename &&
						<div className="truncate text-xs text-lvartsmusic-muted">@ {event.venuename}</div>
					}
				</Link>
			))}
		</div>
	);
}
