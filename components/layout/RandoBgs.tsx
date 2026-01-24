'use client'

import { useEffect, useState } from "react";
import Image from "next/image";
import imageUrl from "@/constants/imageUrl";

export default function RandoBgs() {
	const [randoBg, setRandoBg] = useState<string>('');

	const bgs = [
		'IMG_1705.png',
		'IMG_2873.png',
		'IMG_2873-2.png',
		'IMG_0650.png',
		'IMG_0935.png',
		'IMG_1419.png',
		'IMG_1419-2.png',
		'IMG_2563.png',
		'IMG_0492.png',
		'IMG_1005.png',
		'IMG_2685.png',
		'IMG_2396.png',
		'IMG_2146.png',
		'IMG_2146-2.png',
		'IMG_3971.png',
		'IMG_3971-2.png',
		'IMG_3971-3.png',
		'IMG_2124.png',
		'IMG_2150.png',
		'IMG_2150-2.png',
		'IMG_3727.png',
		'IMG_3996.png',
		'IMG_3996-2.png',
		'IMG_3996-3.png',
		'IMG_3996-4.png',
		'IMG_2194.png',
		'IMG_3945.png',
	]

	const getRandoImage = () => {
		const randoIndex = Math.floor(Math.random() * bgs.length);
		setRandoBg(`${imageUrl}/assets/bgs/${bgs[randoIndex]}?v=${getRandoInt()}`);
	}

	const getRandoInt = ():number => {
		return Math.floor(Math.random() * 100000);
	}

	useEffect(() => {
		getRandoImage();
	}, [])

	return (
		<div className="relative -z-1">
		<div className="overflow-hidden bg-gray-200 h-screen w-full fixed">
			{randoBg !== '' && 
				<Image src={randoBg} alt='random background image' width={2000} height={1500} key={getRandoInt()} style={{height:'100vh', width:'100%', minWidth:'1000px'}} className="hidden md:block"/>
			}
		</div>
		</div>
	);
}
