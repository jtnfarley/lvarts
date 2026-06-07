import {isLoggedIn} from "@/app/data/currentUser";
import { Major_Mono_Display  } from 'next/font/google'

import type { Metadata } from 'next';
import { getGallery } from '../data/posts';
import GalleryItem from "@/components/Gallery/GalleryItem";
import GalleryTitle from "@/components/Gallery/GalleryTitle";
import { shuffleArray } from "@/lib/utils";

export const metadata: Metadata = {
  title: 'Online Art Gallery - Lehigh Vally Art & Music',
  description: "What the what?",
};

const fascinate = Major_Mono_Display({
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
		<div className='rounded-lg mt-5'>
			<div className="flex flex-col gap-5 px-10 items-center w-full">
				<GalleryTitle/>
				<div className='galleryGrid mt-20 w-full'>
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
