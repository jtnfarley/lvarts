'use client'

import type { FeedRow } from '@/lib/models/initFeedRow';
import EventUi from './EventUi';
import EventsByMonthHeader from './EventsByMonthHeader';
import { useRef, useState } from 'react';

export default function EventsByMonth(props:{events:FeedRow[]}) {
	const events = props.events;
	const monthsRef = useRef<HTMLDivElement | null>(null);
	const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

	const months = ["January", "February", "March", 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

	// Bucket by year + month so e.g. January 2027 sorts after December 2026.
	const eventsByMonth:Array<{name:string,year:string,events:FeedRow[]}> = [];

	const sortedEvents = events
		.filter(event => event.eventdate)
		.sort((a, b) => a.eventdate!.getTime() - b.eventdate!.getTime());

	for (const event of sortedEvents) {
		const date = event.eventdate!;
		const name = months[date.getMonth()];
		const year = date.getFullYear().toString();
		const lastBucket = eventsByMonth[eventsByMonth.length - 1];
		if (lastBucket?.name === name && lastBucket.year === year) {
			lastBucket.events.push(event);
		} else {
			eventsByMonth.push({ name, year, events: [event] });
		}
	}

	const scrollToMonth = (index: number) => {
		const container = monthsRef.current;
		if (!container) return;
		const width = container.clientWidth;
		container.scrollTo({ left: width * index, behavior: 'smooth' });
	};

	const forward = () => {
		setCurrentMonthIndex(prev => {
			const next = Math.min(prev + 1, eventsByMonth.length - 1);
			scrollToMonth(next);
			return next;
		});
	};

	const back = () => {
		setCurrentMonthIndex(prev => {
			const next = Math.max(prev - 1, 0);
			scrollToMonth(next);
			return next;
		});
	};

    return (
		<div className='max-h-screen overflow-x-hidden overflow-y-scroll relative'>
			<div
				className='flex flex-row flex-nowrap w-full overflow-x-auto'
				id='months'
				ref={monthsRef}
			>
				{
					(eventsByMonth && eventsByMonth.length) &&
						eventsByMonth.map(({name, year, events}) => {
							if (events && events.length) {
								return (	
									<div className='month w-full flex flex-col flex-shrink-0 items-center' key={`${year}-${name}`}>
										<EventsByMonthHeader month={name} year={year} forward={forward} back={back}/>
										<div  className="flex flex-col gap-10 w-full">
										{
											events.map((post:FeedRow) => {
												return (
													<EventUi key={post.id} post={post} />
												)
											})
										}
										</div>
									</div>
								)
							}
						})
				}
			</div>
		</div>
    )
}
