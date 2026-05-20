import UserCard from "./Cards/UserCard"
import UserDetails from "@/lib/models/userDetails";
import imageUrl from '@/constants/imageUrl';
import { prisma } from '@/prisma';
import {currentUser} from "@/app/data/currentUser";

const getRandoUsers = async (userdetailsid?:number):Promise<UserDetails[]> => {
	'use server'
	
	const userdetailsCount = await prisma.userdetails.count();
	if (userdetailsCount) {	
		const lessLocalUser = userdetailsCount - 1;	//remove logged-in user
		let skip = Math.floor(Math.random() * (lessLocalUser)); 
		const take = lessLocalUser;

		if (skip > userdetailsCount - take) skip = Math.floor(Math.random() * (userdetailsCount - take));

		const userdetails = await prisma.userdetails.findMany({
			take,
			skip, 
			where: {
				id: {
					not: userdetailsid
				}
			}
		});

		return userdetails
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

	const randUsers:Array<UserDetails> = await getRandoUsers(user?.userdetails?.id)
	
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
								recUsers.map((userdetails: any) => (
									<UserCard
										key={ userdetails.id }
										currentUser={ user }
										recUserId={ userdetails.userid }
										displayname={ userdetails.displayname }
										handle={ userdetails.handle }
										avatar={ (userdetails && userdetails.userdir && userdetails.avatar) ?
											`${imageUrl}/${userdetails.userdir}/${userdetails.avatar}` :
											'/images/melty-man.png'
										}
										biohtml={ userdetails.biohtml }
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
