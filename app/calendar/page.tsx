import Link from 'next/link';

import { auth } from '@/auth';
import Events from "@/components/Events";
import { BiCalendarPlus } from "react-icons/bi";

import type { Metadata } from 'next';
import { prisma } from '@/prisma';
import Post from '@/lib/models/post';
import { redirect } from 'next/navigation';
import User from '@/lib/models/user';

export const metadata: Metadata = {
  title: 'Event Calendar - Lehigh Vally Art & Music',
  description: "What's goin' on?",
};

const getEvents = async ():Promise<Array<Post>> => {
	const posts:Array<Post> = await prisma.posts.findMany({
		where: {
			postType: 'event',
			eventDate: {
				gt: new Date()
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
			eventDate: 'asc'
		},
	})

	return posts
}

export default async function Calendar() {
	const session = await auth();
	let user;

	if (session?.user && session?.user?.id) {
		user = session.user as User;
	}

	const googleMapsApiKey = process.env.GOOGLE_MAPS; //has to be handled on the server

	const events = await getEvents();

	return (
		<div className='bg-gray-50/50 backdrop-blur-sm p-5 rounded-lg mt-5'>
			{user ?
				<div className='flex justify-end'>
					<Link href='/calendar/add-event' title='Add Event'>
						<BiCalendarPlus className='text-4xl'/>
					</Link>
				</div>
				:
				<div>
					<Link href={'/'}>Log in to add events</Link>
				</div>
			}
			<div>
				<Events events={events}/>
			</div>
		</div>
	);
}
