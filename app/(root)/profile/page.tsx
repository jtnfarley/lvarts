import AccountInfo from '@/components/forms/AccountInfo';
import {currentUser} from "@/app/data/currentUser";

export default async function Profile() {
	const user = await currentUser();

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
