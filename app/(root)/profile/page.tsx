import { redirect } from 'next/navigation';
import AccountInfo from '@/components/forms/AccountInfo';
import { auth } from '@/auth';
import User from '@/lib/models/user';

export default async function Profile() {
	const session = await auth();
	let user;

	if (!session?.user || !session?.user?.id) {
		return redirect('/');
	} else {
		user = session.user as User;
	}

	return (
		<div className='flex flex-col gap-5'>
			<div className="rounded-box mt-5 md:p-5 sm:bg-none sm:p-0">
				<div className="flex flex-col items-center justify-center">
					<h1 className="text-2xl font-bold">Profile</h1>
				</div>
				{user &&
					<AccountInfo user={user}/>
				}
			</div>
		</div>
	);
}
