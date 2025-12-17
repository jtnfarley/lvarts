import { getRandoUsers } from "@/app/actions/user"
import { currentUser } from '@/app/actions/currentUser';
import UserCard from "./Cards/UserCard"
import UserDetails from "@/lib/models/userDetails";

export default async function RecUsers() {
	const user = await currentUser()

	if (!user) return null

	const getRecUsers = async ():Promise<Array<UserDetails>> => {
		'use server'
		return await getRandoUsers(user.id)
	}
	
	let recUsers:Array<UserDetails> = await getRecUsers()

	return (
		<section className="lg:bg-white lg:rounded-3xl lg:p-5 sm:bg-none sm:p-0">
			<div className='hidden text-primary text-md uppercase lg:block'>Your Next Best Friend</div>
			<div className="flex lg:mt-7 lg:w-[250] lg:flex-col lg:gap-10">
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
											`https://lvartsmusic-ny.b-cdn.net/${userDetails.userDir}/${userDetails.avatar}` :
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
