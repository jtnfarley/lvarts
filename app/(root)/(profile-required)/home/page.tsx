import {currentUser} from "@/app/data/currentUser";
import AddPostForm from "@/components/forms/AddPostForm"
import Feed from "@/components/Feed";
import RecUsers from '@/components/RecUsers';
import type { Metadata } from 'next';
import { getFeedRow, savePost } from "@/app/data/posts";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: 'Home - Lehigh Vally Arts & Music',
  description: 'Where the good stuff is',
};

export default async function Home() {
	const user = await currentUser();

	if (!user) redirect('/');

	const feed = await getFeedRow(user.userdetails!);

	const googleMapsApiKey = process.env.GOOGLE_MAPS; //has to be handled on the server

	return (
		<div>
			<div className='xl:hidden'>
				<RecUsers/>	
			</div>
			<div>
				<AddPostForm user={user} posttype='post' edited={false} savePost={savePost} />
			</div>
			<div>
				<Feed feed={feed} user={user} getFeedRow={getFeedRow} googleMapsApiKey={googleMapsApiKey}/>
			</div>
		</div>
	);
}
