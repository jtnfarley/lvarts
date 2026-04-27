import UserCard from "./Cards/UserCard"
import UserDetails from "@/lib/models/userDetails";
import imageUrl from '@/constants/imageUrl';
import { prisma } from '@/prisma';
import {currentUser} from "@/app/data/currentUser";

const getRandoUsers = async (userId:string):Promise<UserDetails[]> => {
	'use server'
	
	const userDetailsCount = await prisma.userDetails.count();
	if (userDetailsCount) {
		const skip = Math.floor(Math.random() * (userDetailsCount - 1)); //remove logged-in user
		const userDetails = await prisma.userDetails.findMany({
			take: 5,
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
	const user = await currentUser();
	
	let recUsers:Array<UserDetails> = await getRandoUsers(user.id)

	return (
		<section className="xl:bg-white xl:p-8 lg:bg-none lg:p-0 rounded-lg">
			<div className='hidden text-gray-700 font-bold text-md uppercase xl:flex justify-center'>Your Next Best Friend</div>
			<div className="flex gap-2 justify-between mt-5 xl:w-full xl:flex-col">
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
										bio={ userDetails.bio }
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
