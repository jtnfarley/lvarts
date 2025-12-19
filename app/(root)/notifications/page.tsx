import { currentUser } from '@/app/actions/currentUser';
import NotificationsFeed from "@/components/NotificationsFeed";
import { redirect } from 'next/navigation';

export default async function Notifications() {
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
		<div>
			<NotificationsFeed user={user} getUser={getUser}/>
		</div>
	);
}
