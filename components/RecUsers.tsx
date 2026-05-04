import UserCard from "./Cards/UserCard"
import UserDetails from "@/lib/models/userDetails";
import imageUrl from '@/constants/imageUrl';
import { prisma } from '@/prisma';
import {currentUser} from "@/app/data/currentUser";

const getRandoUsers = async (userId:string):Promise<UserDetails[]> => {
	'use server'
	
	const userDetailsCount = await prisma.userDetails.count();
	if (userDetailsCount) {	
		const lessLocalUser = userDetailsCount - 1;	//remove logged-in user
		let skip = Math.floor(Math.random() * (lessLocalUser)); 
		const take = lessLocalUser;

		if (skip > userDetailsCount - take) skip = Math.floor(Math.random() * (userDetailsCount - take));

		const userDetails = await prisma.userDetails.findMany({
			take,
			skip, 
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

function shuffle(array:Array<any>):Array<any> {
  for (let i = array.length - 1; i > 0; i--) {
    // Pick a random index from 0 to i
    const j = Math.floor(Math.random() * (i + 1));
    // Swap elements array[i] and array[j]
    [array[i], array[j]] = [array[j], array[i]];
  }
  
  return array.slice(0, 5);
}

export default async function RecUsers() {
	const user = await currentUser();

	const randUsers:Array<UserDetails> = await getRandoUsers(user.id)
	
	let recUsers;

	if (randUsers && randUsers.length) {
		recUsers = shuffle(randUsers);
	}

	return (
		<section>
			<div className="flex justify-between xl:w-full xl:flex-col rounded-tl-lg rounded-bl-lg xl:bg-gray-700/30 xl:p-6">
				<div className='hidden text-gray-300 font-bold text-md uppercase xl:flex justify-center'>Your Next Best Friend</div>
				{recUsers && recUsers.length && 
					recUsers.length > 0 ? (
						<>
							{
								recUsers.map((userDetails: any) => (
									<UserCard
										key={ userDetails.id }
										currentUser={ user }
										recUserId={ userDetails.userId }
										displayName={ userDetails.displayName }
										handle={ userDetails.handle }
										avatar={ (userDetails && userDetails.userDir && userDetails.avatar) ?
											`${imageUrl}/${userDetails.userDir}/${userDetails.avatar}` :
											'/images/melty-man.png'
										}
										bioHtml={ userDetails.bioHtml }
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
