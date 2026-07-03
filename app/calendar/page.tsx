import Link from 'next/link';
import {isLoggedIn} from "@/app/data/currentUser";
import EventsByMonth from "@/components/Events/EventsByMonth";
import { BiCalendarPlus } from "react-icons/bi";
import CalendarTitle from "@/components/Events/CalendarTitle";

import type { Metadata } from 'next';
import { getEvents } from '../data/posts';

export const metadata: Metadata = {
  title: 'Event Calendar - Lehigh Vally Art & Music',
  description: "What's goin' on?",
};

export default async function Calendar() {
	const user = await isLoggedIn();

	const googleMapsApiKey = process.env.GOOGLE_MAPS; //has to be handled on the server

	const events = await getEvents();

	return (
		<div className='calendar backdrop-blur-sm p-5 rounded-lg mt-5'>
			<div>
				<div className="flex flex-col gap-5 pb-5">
					<CalendarTitle/>
					{user ?
						<div className='flex justify-end'>
							<a href='/calendar/add-event' title='Add Event'>
								<BiCalendarPlus className='text-4xl'/>
							</a>
						</div>
						:
						<div>
							<Link href={'/'}>Log in to add events</Link>
						</div>
					}
					<div>
						<EventsByMonth events={events}/>
					</div>
				</div>
			</div>
		</div>
	);
}
