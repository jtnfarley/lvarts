import { prisma } from '@/prisma';
import { isLoggedIn } from '@/app/data/currentUser';
import imageUrl from '@/constants/imageUrl';
import { RADIO_FALLBACK_COVER } from '@/constants/radio';
import { RadioProvider, type RadioTrack } from './RadioProvider';
import RadioPlayer from './RadioPlayer';

const getAudioTrack = async (trackname:string):Promise<RadioTrack | null> => {
	'use server'

	const post = await prisma.posts.findFirst({
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

	const audiotrack = post?.audiotracks[0];
	if (!post || !audiotrack) return null;

	const userdir = post.usertoposts[0]?.userdetails?.userdir;

	return {
		postId: post.id,
		trackname: audiotrack.trackname ?? trackname,
		artist: audiotrack.artist ?? '',
		album: audiotrack.album,
		releaseyear: audiotrack.releaseyear,
		coverUrl: audiotrack.coverartfile && userdir
			? `${imageUrl}/${userdir}/${audiotrack.coverartfile}`
			: RADIO_FALLBACK_COVER,
	};
}

export default async function Radio({ children }: Readonly<{ children: React.ReactNode }>) {
	const user = await isLoggedIn();

	return (
		<RadioProvider getAudioTrack={getAudioTrack}>
			{children}
			<RadioPlayer hasBottomNav={Boolean(user)}/>
		</RadioProvider>
	)
}
