import {isLoggedIn} from "@/app/data/currentUser";

import type { Metadata } from 'next';
import { getGallery } from '../data/posts';
import GalleryItem from "@/components/Gallery/GalleryItem";

export const metadata: Metadata = {
  title: 'Online Art Gallery - Lehigh Vally Art & Music',
  description: "What the what?",
};

export default async function Gallery() {
	const user = await isLoggedIn();

	const galleryFiles = await getGallery();
console.log(galleryFiles)
	return (
		<div className='bg-gray-900/50 backdrop-blur-sm p-5 rounded-lg mt-5'>
			<div className="flex flex-col gap-5 pb-5">
				<div className='text-xl text-white'>Lehigh Valley Community Art Gallery</div>
				<div className='galleryGrid'>
					{
						galleryFiles && galleryFiles.length &&
						galleryFiles.map((file, index)  => {
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
