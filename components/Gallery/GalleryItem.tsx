'use client'

import Link from 'next/link';
import imageUrl from '@/constants/imageUrl';
import { FeedRow } from '@/lib/models/initFeedRow';
import { useEffect, useState } from 'react';

const GalleryItem = (props:{file:FeedRow}) => {
	const {file} = props;
	const [image, setImage] = useState<string>();
	const [divWidth, setDivWidth] = useState<number>(0);
	const [divHeight, setDivHeight] = useState<number>(0);
	const [gridColumnSpan, setGridColumnSpan] = useState<number>(1);
	const [gridRowSpan, setGridRowSpan] = useState<number>(1);

	const setUpImage = () => {
		if (!file.userdetails.userdir || !file.postfile) {
			setImage(undefined);
			return;
		}

		const src = `${imageUrl}/${file.userdetails.userdir}/${file.postfile}`;
		const img = new window.Image();
		img.onload = () => {
			const width = img.naturalWidth / 2;
			const height = img.naturalHeight / 2;
			setDivWidth(width);
			setDivHeight(height);
			(width > 300) ? setGridColumnSpan(2) : setGridColumnSpan(1);
			(height > 300) ? setGridRowSpan(2) : setGridRowSpan(1);
		};
		img.src = src;
		setImage(`url(${src})`);
	}

	useEffect(() => {
		setUpImage();
	}, [])

	return (
		<div className='group' style={{
			backgroundImage: image, 
			backgroundSize: `${divWidth}px ${divHeight}px`,
			width: divWidth, 
			height: divHeight,
			maxWidth: '300px',
			gridColumnEnd: `span ${gridColumnSpan}`,
			gridRowEnd: `span ${gridRowSpan}`,
		}}>
			<div className='flex flex-col backdrop-blur-md justify-center items-center text-white invisible opacity-0 transition-all transition-discrete duration-300 group-hover:visible group-hover:opacity-100' style={{width: divWidth, 
			height: divHeight, maxWidth: '300px',}}>
				<div>Artist</div>
				<div className='text-xl font-bold'>{file.userdetails.displayname}</div>
				<div>@{file.userdetails.handle}</div>
			</div>
		</div>					
	);
}

export default GalleryItem;
