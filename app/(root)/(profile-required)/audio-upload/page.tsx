import AddAudioForm from "@/components/forms/AddAudioForm"
import { savePost } from "@/app/data/posts";
import type { Metadata } from 'next';
import {currentUser} from "@/app/data/currentUser";

export const metadata: Metadata = {
  title: 'Add Audio Track - Lehigh Vally Art & Music',
  description: "Let's hear it!",
};

export default async function AddAudio() {
	const user = await currentUser();

	if (!user?.userdetails) return;

	return (
		<div>
			{user &&
				<div>
					<AddAudioForm user={user} savePost={savePost}/>
				</div>
			}
		</div>
	);
}
