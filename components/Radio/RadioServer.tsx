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
			postfile: `${trackname}.mp3`
		},
		orderBy: {
			id: 'desc'
		}
	})

	return audiotrack;
}

export default async function Radio() {
	return (
		<section className="fixed bottom-[86px] md:bottom-0 w-full">
			<Tracks getAudioTrack={getAudioTrack}/>	
		</section>
	)
}
