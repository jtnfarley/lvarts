import Link from 'next/link';

import { currentUser } from '@/app/actions/currentUser';
import AddEventForm from "@/components/forms/AddEventForm"
import Events from "@/components/Events";

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Event Calendar - Lehigh Vally Art & Music',
  description: "What's goin' on?",
};

export default async function AddEvent() {
	const getUser = async () => {
		'use server'
		return await currentUser()
	}

	const user = await getUser();

	if (!user) redirect('/calendar');

	const googleMapsApiKey = process.env.GOOGLE_MAPS; //has to be handled on the server

	const userId = user?.id

	return (
		<div>
			{user &&
				<div>
					<AddEventForm user={user} postType='event' edited={false}/>
				</div>
			}
		</div>
	);
}
