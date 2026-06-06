'use client'

import Link from 'next/link';
import imageUrl from '@/constants/imageUrl';
import { FeedRow } from '@/lib/models/initFeedRow';
import { useEffect, useState } from 'react';
import Image from 'next/image';

const GalleryItem = (props:{file:FeedRow}) => {
	const {file} = props;
	const [image, setImage] = useState<string>();
	const [divWidth, setDivWidth] = useState<number>(0);
	const [divHeight, setDivHeight] = useState<number>(0);
	const [frame, setFrame] = useState<any>();

	const setUpImage = () => {
		if (!file.userdetails.userdir || !file.postfile) {
			setImage(undefined);
			return;
		}

		const src = `${imageUrl}/${file.userdetails.userdir}/${file.postfile}`;
		const img = new window.Image();
		img.onload = () => {
			const aspectRatio = img.naturalWidth / img.naturalHeight;
			const width = img.naturalWidth / 2;
			const finalWidth = (width <= 300) ? width: 300;
			const height = finalWidth / aspectRatio;
			setDivWidth(finalWidth);
			setDivHeight(height);
		};
		img.src = src;
		// setImage(`url(${src})`);
		const frame = frames[Math.floor(Math.random() * frames.length)];
		setFrame(frame);
		setImage(src);
	}

	useEffect(() => {
		setUpImage();
	}, [])

	const frames = [
		{
			name: '1.png',
			slice: '30% 40%',
			width: '100px 150px',
			outset: '1.5rem 1.25rem'
		},
		{
			name: '2.png',
			slice: '30% 40%',
			width: '80px 140px',
			outset: '1.95rem 2rem'
		},
		{
			name: '3.png',
			slice: '30% 40%',
			width: '100px 120px',
			outset: '1.5rem 1.25rem'
		},
		{
			name: '4.png',
			slice: '30% 40%',
			width: '100px 120px',
			outset: '3rem 3.75rem'
		},
		{
			name: '5.png',
			slice: '30% 40%',
			width: '60px 80px',
			outset: '.75rem 1rem'
		},
		{
			name: '6.png',
			slice: '30% 40%',
			width: '60px',
			outset: '1.5rem 1.25rem'
		},
		{
			name: '8.png',
			slice: '30% 40%',
			width: '50px 70px',
			outset: '.75rem 1rem'
		},
		{
			name: '9.png',
			slice: '30% 40%',
			width: '80px',
			outset: '2rem 1.75rem'
		},
	]

	return (
		<div className='group galleryItem relative' style={{
			width: '100%', 
			height: divHeight,
			margin: '0 0 8rem 0',
			breakInside: 'avoid',
		}}>
			<Link href={`/post/${file.id}`} className=''>
				{image && 
				<div className='absolute shadow-2xl shadow-black'>
						<div className='absolute' style={{
							width: divWidth,
							height: divHeight
							}}>
							<Image src={image || ''} 
								alt={`art by ${file.userdetails.displayname}`}
								width={divWidth} 
								height={divHeight}
							/>
						</div>
						<div className='absolute flex flex-col backdrop-blur-md justify-center items-center text-white invisible opacity-0 transition-all transition-discrete duration-300 group-hover:visible group-hover:opacity-100' 
						style={{width: divWidth, height: divHeight}}>
							<div>Artist</div>
							<div className='text-xl font-bold'>{file.userdetails.displayname}</div>
							<div>@{file.userdetails.handle}</div>
						</div>
						<div className='absolute' style={{
							borderImageSource: `url("/images/frames/${frame.name}")`,
							borderImageSlice: '30% 40%',
							borderImageWidth: frame.width,
							borderImageOutset: frame.outset,
							width: divWidth,
							height: divHeight
							}}>
						</div>
					</div>
				}
			</Link>
		</div>					
	);
}

export default GalleryItem;
