import UserDetails from "@/lib/models/userDetails";
import { prisma } from '@/prisma';
import {currentUser} from "@/app/data/currentUser";
import RecUsersShuffler from "./Cards/RecUsersShuffler";

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

export default async function RecUsers() {
	const user = await currentUser();

	const randUsers:Array<UserDetails> = await getRandoUsers(user?.userdetails?.id)

	return (
		<section>
			<RecUsersShuffler randUsers={randUsers} user={user}/>
		</section>
	)
}
