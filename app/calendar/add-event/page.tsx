import AddEventForm from "@/components/forms/AddEventForm"

import type { Metadata } from 'next';
import {currentUser} from "@/app/data/currentUser";

export const metadata: Metadata = {
  title: 'Event Calendar - Lehigh Vally Art & Music',
  description: "What's goin' on?",
};

export default async function AddEvent() {
	const user = await currentUser();

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
