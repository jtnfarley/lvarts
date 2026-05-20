import UserProfile from '@/components/UserProfile';
import {currentUser} from "@/app/data/currentUser";
import { getUserDAL } from "@/app/data/user";
import { getFeedRow } from '@/app/data/posts';

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ [key: string]: string }>;
}) {
	const {handle} = await params;

	const user = await currentUser();

	const userProfile = await getUserDAL(handle);

	if (!userProfile) return null;

	const userPosts = await getFeedRow(userProfile);

	const googleMapsApiKey = process.env.GOOGLE_MAPS; //has to be handled on the server

	return (
		<>
            {
			googleMapsApiKey && user && userProfile &&
				<div className='pb-5'>
					<UserProfile currentUser={user} userProfile={userProfile} posts={userPosts} getOldPosts={getFeedRow} googleMapsApiKey={googleMapsApiKey}/>
				</div>
			}
		</>
	);
}
