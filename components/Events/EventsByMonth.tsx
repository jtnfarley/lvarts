'use client'

import Post from '@/lib/models/post';
import EventUi from './EventUi';
import EventsByMonthHeader from './EventsByMonthHeader';
import { useRef, useState } from 'react';

export default function EventsByMonth(props:{events:Post[]}) {
	const events = props.events;
	const monthsRef = useRef<HTMLDivElement | null>(null);
	const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

	const months = ["January", "February", "March", 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

	const eventsByMonth:Array<{name:string,events:Post[]}> = [];

	const getEventsByMonth = () => {
		months.map((month, i) => {
			eventsByMonth.push({
				name: month,
				events: events.filter(event => event.eventDate?.getMonth() === i)
			})
		})
	}

	getEventsByMonth()

	const scrollToMonth = (index: number) => {
		const container = monthsRef.current;
		if (!container) return;
		const width = container.clientWidth;
		container.scrollTo({ left: width * index, behavior: 'smooth' });
	};

	const forward = () => {
		setCurrentMonthIndex(prev => {
			const next = Math.min(prev + 1, months.length - 1);
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

	const getYear = (events:any[] | undefined):string => {
		return (events && events.length) ? events[0].eventDate?.getFullYear().toString() : new Date().getFullYear().toString()
	}
	
    return (
		<div className='max-h-screen overflow-x-hidden overflow-y-scroll relative'>
			<div
				className='flex flex-row flex-nowrap w-full overflow-x-auto'
				id='months'
				ref={monthsRef}
			>
				{
					(eventsByMonth && eventsByMonth.length) &&
						eventsByMonth.map(({name, events}, i) => {
							if (events && events.length) {
								return (	
									<div className='month w-full flex flex-col flex-shrink-0 items-center' key={i}>
										<EventsByMonthHeader month={name} year={getYear(events)} forward={forward} back={back}/>
										<div  className="lg:grid lg:grid-cols-3 md:flex md:flex-col gap-4">
										{
											events.map((post:Post) => {
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
