import AccountInfo from '@/components/forms/AccountInfo';
import {currentUser} from "@/app/data/currentUser";
import { updateUser, type UpdateUserParams } from "@/app/data/user"
import { getSidebarProfile } from '@/app/data/userProfiles';
import type SidebarProfile from '@/lib/models/sidebarProfile';

export default async function Profile() {
	const user = await currentUser();

	const userProfile: SidebarProfile = user.userdetails?.handle
		? (await getSidebarProfile(user.userdetails.handle)) ?? {
			id: user.userdetails?.id ?? 0,
			userid: user.id,
			handle: user.userdetails?.handle ?? null,
			displayname: user.userdetails?.displayname ?? null,
			avatar: user.userdetails?.avatar ?? null,
			userdir: user.userdetails?.userdir ?? null,
			followers: [],
			following: [],
			biohtml: user.userdetails?.biohtml ?? null,
			biolexical: user.userdetails?.biolexical ?? null,
			postcount: 0,
			followerscount: 0,
			followingcount: 0,
			urls: []
		}
		: {
			id: user.userdetails?.id ?? 0,
			userid: user.id,
			handle: null,
			displayname: null,
			avatar: null,
			userdir: null,
			followers: [],
			following: [],
			biohtml: null,
			biolexical: null,
			postcount: 0,
			followerscount: 0,
			followingcount: 0,
			urls: []
		};

	const saveUser = async (user:UpdateUserParams) => {
		'use server'
		
		return updateUser(user);
	}

	return (
		<div className='flex flex-col gap-5'>
			<div className="rounded-box lvartsmusic-card p-3 md:p-5 sm:bg-none sm:p-0">
				<div className="flex flex-col items-center justify-center">
					<h1 className="text-2xl font-bold">Profile</h1>
				</div>
				<AccountInfo userdetails={userProfile} saveUser={saveUser}/>
			</div>
		</div>
	);
}
