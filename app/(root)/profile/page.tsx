import { currentUser } from '@/app/actions/currentUser';
import AccountInfo from '@/components/forms/AccountInfo';

export default async function Profile() {
	const user = await currentUser()

	if (!user) return

	return (
		<div>
			<div className="flex flex-col items-center justify-center">
				<h1 className="text-2xl font-bold">Profile</h1>
			</div>
			<AccountInfo user={user}/>
		</div>
	);
}
