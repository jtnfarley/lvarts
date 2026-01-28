import {currentUser} from "@/app/data/currentUser";
import AddPostForm from "@/components/forms/AddPostForm"
import Feed from "@/components/Feed";
import RecUsers from '@/components/RecUsers';
import { redirect } from 'next/navigation';

import type { Metadata } from 'next';
import User from '@/lib/models/user';
import Post from '@/lib/models/post';
import { prisma } from '@/prisma';

export const metadata: Metadata = {
  title: 'Home - Lehigh Vally Arts & Music',
  description: 'Where the good stuff is',
};

const getInitFeed = async (user:User):Promise<Array<Post>> => {
	const posts:Array<Post> = await prisma.posts.findMany({
		where: {
			OR: [
				{ userId: user?.id },
				{ userId: {
					in: user?.userDetails?.following
				}},
			],
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
	})

	return posts
}

const getNewPosts = async (user:User, lastChecked:Date):Promise<Array<Post>> => {
	'use server'

	const posts:Array<Post> = await prisma.posts.findMany({
		where: {
			OR: [
				{ userId: user?.id },
				{ userId: {
					in: user?.userDetails?.following
				}},
			],
			postType: {
				not: 'chat'
			},
			createdAt: { gt: lastChecked }
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
		take: 20
	})

	return posts
}

const getOldPosts = async (user:User, skip?:number):Promise<Array<Post>> => {
	'use server'

	const posts:Array<Post> = await prisma.posts.findMany({
		where: {
			OR: [
				{ userId: user?.id },
				{ userId: {
					in: user?.userDetails?.following
				}},
			],
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

export default async function Home() {
	const user = await currentUser();
	
	if (!user.userDetails || !user.userDetails.displayName || user.userDetails.displayName === '') {
		return redirect('/profile')
	}

	const feed = await getInitFeed(user)

	const googleMapsApiKey = process.env.GOOGLE_MAPS; //has to be handled on the server

	return (
		<div>
			<div className='xl:hidden'>
				<RecUsers/>	
			</div>
			<div>
				<AddPostForm user={user} postType='post' edited={false}/>
			</div>
			<div>
				<Feed feed={feed} user={user} getNewPosts={getNewPosts} getOldPosts={getOldPosts} googleMapsApiKey={googleMapsApiKey}/>
			</div>
		</div>
	);
}
