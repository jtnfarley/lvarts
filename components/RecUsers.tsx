import { getRandoUsers } from "@/app/actions/user"
import { currentUser } from '@/app/actions/currentUser';
import UserCard from "./Cards/UserCard"
import UserDetails from "@/lib/models/userDetails";
import imageUrl from '@/constants/imageUrl';

export default async function RecUsers() {
	const user = await currentUser()

	if (!user) return null

	const getRecUsers = async ():Promise<Array<UserDetails>> => {
		'use server'
		return await getRandoUsers(user.id)
	}
	
	let recUsers:Array<UserDetails> = await getRecUsers()

	return (
		<section className="xl:bg-gray-50/70 xl:backdrop-blur-sm xl:rounded-3xl xl:p-5 lg:bg-none lg:p-0">
			<div className='hidden text-gray-700 font-bold text-md uppercase xl:block'>Your Next Best Friend</div>
			<div className="flex xl:mt-7 xl:w-[250] xl:flex-col gap-3">
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
										avatar={ (userDetails && userDetails.userDir && userDetails.avatar) ?
											`${imageUrl}/${userDetails.userDir}/${userDetails.avatar}` :
											'/images/melty-man.png'
									}
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
		</section>
	)
}
