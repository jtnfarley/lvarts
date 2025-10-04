import { currentUser } from '@/app/actions/currentUser';
import LandingPage from '@/components/shared/LandingPage';
import AddPostForm from "@/components/forms/AddPostForm"
import Feed from "@/components/shared/Feed";
import { redirect } from 'next/navigation';

export default async function Home() {
	const user = await currentUser()

	if (!user || !user?.id) {
		return (
			<LandingPage/>
		)
	}

	if (!user.userDetails || !user.userDetails.displayName || user.userDetails.displayName === '') {
		return redirect('/profile')
	}

	const userId = user?.id

	return (
		<>
			<div>
				<AddPostForm userId={userId} postType='post' edited={false}/>
			</div>
			<div>
				<Feed/>
			</div>
		</>
	);
}
