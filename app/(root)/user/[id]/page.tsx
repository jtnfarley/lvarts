import Post from '@/lib/models/post';
import { prisma } from '@/prisma';
import { redirect } from 'next/navigation';
import UserProfile from '@/components/UserProfile';
import { auth } from '@/auth';
import User from '@/lib/models/user';

const getUserDetailsWithPosts = async (userId:string) => {
	const userDetails = await prisma.userDetails.findFirst({
		where: {
			userId
		},
		include: {
			posts: {
				where: {
					postType: {
						not: 'chat'
					}
				},
				include: {
					parentPost:true,
					userDetails: true
				},
				orderBy: {
					createdAt: 'desc'
				},
				take: 20
			}
		}
	})

	return userDetails
}

const getOldPosts = async (userId:string, skip?:number):Promise<Array<Post>> => {
	'use server'

	const posts:Array<Post> = await prisma.posts.findMany({
		where: {
			userId,
			postType: {
				not: 'chat'
			}
		},
		include: {
			user:true,
			userDetails: true,
			parentPost: {
				include: {
					userDetails: true
				}
			}
		},
		orderBy: {
			createdAt: 'desc'
		},
		take: 20,
		skip: (skip) ? skip + 1 : 0
	})

	return posts
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ [key: string]: string }>;
}) {
	const {id} = await params;

	const session = await auth();
	let user;

	if (!session?.user || !session?.user?.id) {
		return redirect('/');
	} else {
		user = session.user as User;
	}

	const userDetails = await getUserDetailsWithPosts(id.toString());

	const googleMapsApiKey = process.env.GOOGLE_MAPS; //has to be handled on the server

	return (
		<>
            {
			googleMapsApiKey && user && userDetails &&
				<div className='pb-5'>
					<UserProfile currentUser={user} userDetails={userDetails} getOldPosts={getOldPosts} googleMapsApiKey={googleMapsApiKey}/>
				</div>
			}
		</>
	);
}
