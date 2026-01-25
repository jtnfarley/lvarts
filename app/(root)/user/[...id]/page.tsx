import { currentUser } from '@/app/actions/currentUser';
import UserDetails from '@/lib/models/userDetails';
import User from '@/lib/models/user';
import Post from '@/lib/models/post';
import { prisma } from '@/prisma';
import { redirect } from 'next/navigation';
import UserProfile from '@/components/UserProfile';

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

	const user = await currentUser();

	if (!user) return redirect('/');

	const userDetails = await getUserDetailsWithPosts(id.toString());

	const googleMapsApiKey = process.env.GOOGLE_MAPS; //has to be handled on the server

	// const getSingleUser = async () => {

	// 	const singleUser = await getUserDetailsWithPosts(params.id.toString())
	// 	if (!singleUser) return

	// 	setSingleUser(singleUser);

	// 	if (singleUser.posts) {
	// 		setPosts(singleUser.posts);
	// 	}
	// 	const avatarUrlBase = imageUrl;
    // 	const avatarUrlInit = singleUser && singleUser.avatar && singleUser.userDir ? `${avatarUrlBase}/${singleUser.userDir}/${singleUser.avatar}` : undefined;
	// 	setAvatarUrl(avatarUrlInit)

	// 	setRenderKey(prev => prev + 1)
	// }

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
