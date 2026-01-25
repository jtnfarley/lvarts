import { currentUser } from '@/app/actions/currentUser';
import UserCard from "./Cards/UserCard"
import UserDetails from "@/lib/models/userDetails";
import imageUrl from '@/constants/imageUrl';
import { prisma } from '@/prisma';

const getRandoUsers = async (userId:string):Promise<UserDetails[]> => {
	'use server'
	
	const userDetailsCount = await prisma.userDetails.count();
	if (userDetailsCount) {
		const skip = Math.floor(Math.random() * (userDetailsCount - 1)); //remove logged-in user
		const userDetails = await prisma.userDetails.findMany({
			// take: 5,
			// skip: skip,
			where: {
				userId: {
					not: userId
				}
			}
		});

		return userDetails
	}

	return [];
}

export default async function RecUsers() {
	const user = await currentUser()

	if (!user) return null
	
	let recUsers:Array<UserDetails> = await getRandoUsers(user.id)

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
