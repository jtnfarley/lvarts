import Link from 'next/link';

import { currentUser } from '@/app/actions/currentUser';
import Events from "@/components/Events";
import { BiCalendarPlus } from "react-icons/bi";

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Event Calendar - Lehigh Vally Art & Music',
  description: "What's goin' on?",
};

export default async function Calendar() {
	const getUser = async () => {
		'use server'
		return await currentUser()
	}

	const user = await getUser();

	const googleMapsApiKey = process.env.GOOGLE_MAPS; //has to be handled on the server

	const userId = user?.id

	return (
		<div className='bg-gray-50/50 backdrop-blur-sm p-5 rounded-lg mt-5'>
			{user ?
				<div className='flex justify-end'>
					<Link href='/calendar/add-event' title='Add Event'>
						<BiCalendarPlus className='text-4xl'/>
					</Link>
				</div>
				:
				<div>
					<Link href={'/'}>Log in to add events</Link>
				</div>
			}
			<div>
				<Events/>
			</div>
		</div>
	);
}
