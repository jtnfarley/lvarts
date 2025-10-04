import { getRandoUsers } from "@/app/actions/user"
import { currentUser } from '@/app/actions/currentUser';
import UserCard from "./Cards/UserCard"
import User from "@/lib/models/user";

export default async function RightSidebar() {
	const user = await currentUser()

	if (!user) return null

	const getRecUsers = async ():Promise<Array<User>> => {
		'use server'
		return await getRandoUsers(user.id)
	}
	
	let recUsers:Array<User> = await getRecUsers()

	return (
		<section className="custom-scrollbar rightsidebar">
			<div className="flex flex-1 flex-col justify-start">
				<h3 className="text-lg font-semibold text-light-1">Suggestions</h3>
			</div>

			<div className="flex flex-col flex-1 justify-start">
				<h3 className="text-lg font-semibold text-light-1">Groups</h3>
			</div>

			<div className="flex flex-col flex-1 justify-start">
				<h3 className="text-lg font-semibold text-light-1">Users</h3>
				<div className="mt-7 flex w-[350] flex-col gap-10">
					{
						recUsers.length > 0 ? (
							<>
								{
									recUsers.map((userDetails: any) => (
										<UserCard
											key={ userDetails.id }
											currentUser={ user }
											recUserId={ userDetails.userId }
											displayName={ userDetails.displayName }
											avatar={ userDetails.avatar }
											// userType = 'User'
										/>
									))
								}
							
							</>
						) : (
							<p className="!text-base-regular text-light-3">No users yet</p>
						)
					}
				</div>
			</div>
			
		</section>
	)
}
