import { currentUser } from '@/app/actions/currentUser';
import AddPostForm from "@/components/forms/AddPostForm"
import Feed from "@/components/Feed";
import RecUsers from '@/components/RecUsers';
import { redirect } from 'next/navigation';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home - Lehigh Vally Arts & Music',
  description: 'Where the good stuff is',
};

export default async function Home() {
	const getUser = async () => {
		'use server'
		return await currentUser()
	}

	const user = await getUser();

	if (!user) return redirect('/signin');
	
	if (!user.userDetails || !user.userDetails.displayName || user.userDetails.displayName === '') {
		return redirect('/profile')
	}

	const googleMapsApiKey = process.env.GOOGLE_MAPS; //has to be handled on the server

	const userId = user?.id

	return (
		<div>
			<div className='xl:hidden'>
				<RecUsers/>	
			</div>
			<div>
				<AddPostForm user={user} postType='post' edited={false}/>
			</div>
			<div>
				<Feed user={user} getUser={getUser} googleMapsApiKey={googleMapsApiKey}/>
			</div>
		</div>
	);
}
