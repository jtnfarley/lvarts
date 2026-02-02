import {currentUser} from "@/app/data/currentUser";
import AddPostForm from "@/components/forms/AddPostForm"
import Feed from "@/components/Feed";
import RecUsers from '@/components/RecUsers';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getInitFeed, getNewPosts, getOldPosts, savePost } from "@/app/data/posts";

export const metadata: Metadata = {
  title: 'Home - Lehigh Vally Arts & Music',
  description: 'Where the good stuff is',
};

export default async function Home() {
	const user = await currentUser();
	
	if (!user.userDetails || !user.userDetails.displayName || user.userDetails.displayName === '') {
		return redirect('/profile')
	}

	const feed = await getInitFeed(user)

	const googleMapsApiKey = process.env.GOOGLE_MAPS; //has to be handled on the server

	return (
		<div>
			<div className='xl:hidden'>
				<RecUsers/>	
			</div>
			<div>
				<AddPostForm user={user} postType='post' edited={false} savePost={savePost} />
			</div>
			<div>
				<Feed feed={feed} user={user} getNewPosts={getNewPosts} getOldPosts={getOldPosts} googleMapsApiKey={googleMapsApiKey}/>
			</div>
		</div>
	);
}
