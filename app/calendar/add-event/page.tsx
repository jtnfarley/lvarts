import AddEventForm from "@/components/forms/AddEventForm"

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import User from '@/lib/models/user';

export const metadata: Metadata = {
  title: 'Event Calendar - Lehigh Vally Art & Music',
  description: "What's goin' on?",
};

export default async function AddEvent() {
	const session = await auth();
	let user;

	if (!session?.user || !session?.user?.id) {
		return redirect('/calendar');
	} else {
		user = session.user as User;
	}


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
