import { auth } from '@/auth';
import LandingPage from '@/components/shared/LandingPage';
import AddPostForm from "@/components/forms/AddPostForm"
import Feed from "@/components/shared/Feed";

export default async function Home() {
	const session = await auth();

	if (!session?.user || !session?.user?.id) {
		return (
			<LandingPage/>
		)
	}

	const userId = session?.user?.id

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
