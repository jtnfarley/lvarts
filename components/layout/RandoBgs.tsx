'use client'

import { useEffect, useState } from "react";
import Image from "next/image";

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
		'IMG_0492.png'
	]

	const getRandoImage = () => {
		const randoIndex = Math.floor(Math.random() * bgs.length);
		setRandoBg(`/images/bgs/${bgs[randoIndex]}?v=${getRandoInt()}`);
	}

	const getRandoInt = ():number => {
		return Math.floor(Math.random() * 100000);
	}

	useEffect(() => {
		getRandoImage();
	}, [])

	return (
		<div className="relative overflow-hidden">
			{randoBg !== '' && 
				<Image src={randoBg} alt='random background image' width={2000} height={1500} key={getRandoInt()} style={{height:'100vh', position:'fixed', width:'100%', minWidth:'1000px', zIndex:-1}}/>
			}
		</div>
	);
}
