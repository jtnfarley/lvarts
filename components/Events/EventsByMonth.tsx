import type { FeedRow } from '@/lib/models/initFeedRow';
import EventUi from './EventUi';
import BackToTop from './BackToTop';

type MonthBucket = { id: string, name: string, year: string, events: FeedRow[] };

const monthFormat = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', month: 'long' });
const yearFormat = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric' });
const monthNumberFormat = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', month: '2-digit' });

// Bucket by year + month (Eastern) so e.g. January 2027 sorts after December 2026.
function groupByMonth(events: FeedRow[]): MonthBucket[] {
	const sortedEvents = events
		.filter(event => event.eventdate)
		.sort((a, b) => a.eventdate!.getTime() - b.eventdate!.getTime());

	const buckets: MonthBucket[] = [];
	for (const event of sortedEvents) {
		const date = event.eventdate!;
		const year = yearFormat.format(date);
		const id = `${year}-${monthNumberFormat.format(date)}`;
		const lastBucket = buckets[buckets.length - 1];
		if (lastBucket?.id === id) {
			lastBucket.events.push(event);
		} else {
			buckets.push({ id, name: monthFormat.format(date), year, events: [event] });
		}
	}
	return buckets;
}

export default function EventsByMonth(props:{events:FeedRow[]}) {
	const months = groupByMonth(props.events);

	if (months.length === 0) {
		return <div>No upcoming events.</div>;
	}

	return (
		<div>
			<BackToTop/>
			{/* top-16 sits below the sticky TopBar */}
			<nav
				aria-label='Jump to month'
				className='sticky top-16 z-10 -mx-1 mb-6 flex gap-2 overflow-x-auto bg-lvartsmusic-background/90 px-1 py-3 backdrop-blur'
			>
				{months.map(({ id, name, year }) => (
					<a
						key={id}
						href={`#${id}`}
						className='shrink-0 rounded-full border border-lvartsmusic-border px-3 py-1 text-sm font-semibold hover:bg-lvartsmusic-accent hover:text-lvartsmusic-accent-foreground'
					>
						{name.slice(0, 3)} {year}
					</a>
				))}
			</nav>

			{months.map(({ id, name, year, events }) => (
				<section key={id} id={id} className='scroll-mt-32 mb-12'>
					<h2 className='mb-5 border-b border-lvartsmusic-border pb-2 text-2xl font-bold'>
						{name} {year}
					</h2>
					<div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
						{events.map(post => <EventUi key={post.id} post={post}/>)}
					</div>
				</section>
			))}
		</div>
	)
}
