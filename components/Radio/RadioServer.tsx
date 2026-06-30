import { prisma } from '@/prisma';
import Tracks from './Tracks';

const getAudioTrack = async (trackname:string) => {
	'use server'

	const audiotrack = await prisma.posts.findFirst({
		include: {
			audiotracks: true,
			usertoposts: {
				include: {
					userdetails:true
				}
			}
		},
		where: {
			postfile: {
				equals: `${trackname}.mp3`,
				mode: 'insensitive'
			}
		},
		orderBy: {
			id: 'desc'
		}
	})

	return audiotrack;
}

export default async function Radio() {
	return (
		<section className="fixed bottom-[62px] md:bottom-0 w-full z-50">
			<Tracks getAudioTrack={getAudioTrack}/>	
		</section>
	)
}
