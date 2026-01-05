import Link from 'next/link';

import { currentUser } from '@/app/actions/currentUser';
import AddEventForm from "@/components/forms/AddEventForm"
import Feed from "@/components/Feed";

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
		<div>
			{user ?
				<div>
					<AddEventForm user={user} postType='event' edited={false}/>
				</div>
				:
				<div>
					<Link href={'/'}>Log in to add events</Link>
				</div>
			}
			<div>
				{/* <Feed user={user} getUser={getUser} googleMapsApiKey={googleMapsApiKey}/> */}
			</div>
		</div>
	);
}
