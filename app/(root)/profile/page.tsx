import { currentUser } from '@/app/actions/currentUser';
import AccountInfo from '@/components/forms/AccountInfo';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile - Lehigh Vally Arts & Music',
  description: 'Create your personality',
};

export default async function Profile() {
	const user = await currentUser()

	if (!user) return

	return (
		<div className="rounded-box mt-5 lg:bg-white lg:rounded-3xl lg:p-5 sm:bg-none sm:p-0">
			<div className="flex flex-col items-center justify-center">
				<h1 className="text-2xl font-bold">Profile</h1>
			</div>
			<AccountInfo user={user}/>
		</div>
	);
}
