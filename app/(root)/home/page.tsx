import { currentUser } from '@/app/actions/currentUser';
import AddPostForm from "@/components/forms/AddPostForm"
import Feed from "@/components/shared/Feed";
import RecUsers from '@/components/shared/RecUsers';
import { redirect } from 'next/navigation';

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

	const userId = user?.id

	return (
		<>
			<div className='lg:hidden sm:block'>
				<RecUsers/>	
			</div>
			<div>
				<AddPostForm user={user} postType='post' edited={false}/>
			</div>
			<div>
				<Feed user={user} getUser={getUser}/>
			</div>
		</>
	);
}
