import MusikfestSchedulerForm from "@/components/forms/MusikfestSchedulerForm";
import { savePost } from "@/app/data/posts";
import type { Metadata } from 'next';
import {currentUser} from "@/app/data/currentUser";

export const metadata: Metadata = {
  title: 'Musikfest Schedule Generator - Lehigh Vally Art & Music',
  description: "Vibe your perfect 'fest schedule",
};

export default async function MusikfestScheduler() {
	const user = await currentUser();

	if (!user?.userdetails) return;

	return (
		<div>
			{user &&
				<div>
					<MusikfestSchedulerForm user={user} savePost={savePost}/>
				</div>
			}
		</div>
	);
}
