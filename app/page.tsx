import { currentUser } from '@/app/actions/currentUser';
import LandingPage from '@/components/LandingPage';
import { redirect } from 'next/navigation';

export default async function RootPage() {
	const getUser = async () => {
		'use server'
		return await currentUser()
	}

	const user = await getUser();

	if (user) return redirect('/home');

	return (
		<div>
			<LandingPage/>
		</div>
	);
}
