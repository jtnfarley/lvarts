import {isLoggedIn} from "@/app/data/currentUser";
import { Fascinate } from 'next/font/google'

import type { Metadata } from 'next';
import { getGallery } from '../data/posts';
import GalleryItem from "@/components/Gallery/GalleryItem";
import { shuffleArray } from "@/lib/utils";

export const metadata: Metadata = {
  title: 'Online Art Gallery - Lehigh Vally Art & Music',
  description: "What the what?",
};

const fascinate = Fascinate({
  	weight: "400",
	subsets: []
})

export default async function Gallery() {
	const user = await isLoggedIn();

	const galleryFiles = await getGallery();

	let shuffledFiles;

	if (galleryFiles && galleryFiles.length) {
		shuffledFiles = shuffleArray(galleryFiles);
	}

	return (
		<div className='bg-[url(/images/frames/marble.png)] bg-cover rounded-lg mt-5'>
			<div className="flex flex-col gap-5 p-10">
				<div className={`text-7xl text-gray-900 text-center ${fascinate.className}`}>Lehigh Valley Community Art Gallery</div>
				<div className='galleryGrid mt-20'>
					{
						shuffledFiles && shuffledFiles.length &&
						shuffledFiles.map((file, index)  => {
							return (
								<GalleryItem file={file} key={index}/>
							)
						})
					}
				</div>
			</div>
		</div>
	);
}
