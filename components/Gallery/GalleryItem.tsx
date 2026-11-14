'use client'

import Link from 'next/link';
import imageUrl from '@/constants/imageUrl';
import { FeedRow } from '@/lib/models/initFeedRow';
import { useEffect, useState } from 'react';
import Image from 'next/image';

// Target row height in px; rows grow or shrink from this to fill the full width.
const ROW_HEIGHT = 280;

const GalleryItem = (props:{file:FeedRow}) => {
	const {file} = props;
	const [image, setImage] = useState<string>();
	const [aspectRatio, setAspectRatio] = useState<number>();

	useEffect(() => {
		if (!file.userdetails.userdir || !file.postfile) {
			setImage(undefined);
			return;
		}

		const src = `${imageUrl}/${file.userdetails.userdir}/${file.postfile}`;
		const img = new window.Image();
		img.onload = () => {
			setAspectRatio(img.naturalWidth / img.naturalHeight);
			setImage(src);
		};
		img.src = src;
	}, [file.userdetails.userdir, file.postfile])

	// Nothing to size until the image has been measured.
	if (!image || !aspectRatio) return null;

	return (
		<div className='group galleryItem relative' style={{
			flex: `${aspectRatio} 1 ${aspectRatio * ROW_HEIGHT}px`,
			aspectRatio
		}}>
			<Link href={`/post/${file.id}`}>
				<Image src={image}
					alt={`art by ${file.userdetails.displayname}`}
					fill
					sizes='(max-width: 768px) 100vw, 50vw'
					className='block object-cover'
				/>
				<div className='absolute inset-0 flex flex-col backdrop-blur-md justify-center items-center text-white invisible opacity-0 transition-all transition-discrete duration-300 group-hover:visible group-hover:opacity-100'>
					<div>Artist</div>
					<div className='text-xl font-bold'>{file.userdetails.displayname}</div>
					<div>@{file.userdetails.handle}</div>
				</div>
			</Link>
		</div>
	);
}

export default GalleryItem;
