'use client'

import { useEffect, useState } from "react";

const bgs = [
		'IMG_1705.png',
		'IMG_2873.png',
		'IMG_2873-2.png',
		'IMG_0650.png',
		'IMG_1419-2.png',
		'IMG_0492.png',
		'IMG_2396.png',
		'IMG_2124.png',
		'IMG_2150-2.png',
		'IMG_3727.png',
	]

export default function RandoBgs() {
	// const [randoGradient, setRandoGradient] = useState<{backgroundImage:string, clipPath?:string, opacity?:number, animation?:string}>({
	// 	backgroundImage:`linear-gradient(to top right, #434453, #4354fd)`,
	// 	clipPath: `polygon(0)`,
	// 	opacity: 1,
	// 	animation: ''
	// });

	const [randoBg, setRandoBg] = useState<{
		backgroundColor?:string, 
		backgroundImage?:string, 
		backgroundRepeat?:string, 
		backgroundPosition?:string, 
		backgroundSize?:string, 
		animation?:string}>
		({
			backgroundColor: '#efefef',
			backgroundImage: `url()`,
			backgroundRepeat: 'no-repeat',
			backgroundPosition: 'center center',
			backgroundSize: 'cover', // This will now persist correctly
			animation:''
	});

	// const tb = ['top','bottom', ''];
	// const lr = ['left','right', ''];
	// const gradientTypes = ['linear', 'conic']
	// // const alphaNum = [
	// // 	'a','b','c','d','e','f','0','1','2','3','4','5','6','7','8','9'
	// // ]

	// const randHex = ():string => {
	// 	let hex = '';
	// 	return `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.random() + 0.5})`
	// }

	// const randDeg = () => Math.floor(Math.random() * 360);

	// const getLinearGradient = (iterator:number = 3):string => {
	// 	let randHexes = '';
	// 	for (let i = Math.floor(Math.random() * iterator) + 2; i >= 0 ; i--) {
	// 		randHexes += `${randHex()}${(i > 0) ? ',':''}`
	// 	}
	// 	return `linear-gradient(${randDeg()}deg, ${randHexes})`;
	// }

	// const getRadialGradient = ():string => {
	// 	const shapes = ['ellipse', 'circle'];
	// 	const randShape = shapes[Math.floor(Math.random() * shapes.length)];
	// 	let randHexes = '';
	// 	for (let i = Math.floor(Math.random() * 3) + 2; i >= 0 ; i--) {
	// 		randHexes += `${randHex()} ${Math.floor(Math.random() * 100)}%${(i > 0) ? ',':''}`
	// 	}
	// 	return `radial-gradient(${randShape}, ${randHexes})`;
	// }

	// const getConicGradient = ():string => {
	// 	let randHexes = '';
	// 	const iterator =  Math.floor(Math.random() * 360) + 150;
	// 	const numOfDegrees = 360 / iterator;
	// 	console.log(iterator, numOfDegrees)
	// 	let lastDegree = 360;
	// 	for (let i = Math.floor(Math.random() * 10) + 2; i >= 0 ; i--) {
	// 		const degrees = Math.floor(Math.random() * lastDegree);
	// 		randHexes += `${randHex()}${(i > 0) ? ',':''}`
	// 		lastDegree = lastDegree - degrees;
	// 	}
	// 	return `conic-gradient(${randHexes})`;
	// }

	// const getClipPath = ():string => {
	// 	let polygon = '';
	// 	for (let i = Math.floor(Math.random() * 30) + 10; i >= 0; i--) {
	// 		polygon += `${Math.floor(Math.random() * 100)}% ${Math.floor(Math.random() * 100)}%${(i > 0) ? ',':''}`
	// 	}
	// 	return `polygon(${polygon})`;
	// }

	const getRandoGradient = () => {
		// const randoGradType = gradientTypes[Math.floor(Math.random() * gradientTypes.length)];
		// let gradient = {
		// 	backgroundImage:'',
		// 	clipPath: 'polygon(0)',
		// 	opacity: 1,
		// 	animation:''
		// };

		let bg = {
			backgroundColor: '#efefef',
			backgroundImage: `url()`,
			backgroundRepeat: 'no-repeat',
			backgroundPosition: 'center center',
			backgroundSize: 'cover', // This will now persist correctly
			animation:''
		};
		
		// switch (randoGradType) {
		// 	case 'linear':
		// 		gradient.backgroundImage = getLinearGradient();
		// 		gradient.clipPath = getClipPath();
		// 		break;
		// 	// case 'radial':
		// 	// 	// bg.backgroundImage = getRadialGradient();
		// 	// 	gradient.backgroundImage = getRadialGradient();
		// 	// 	gradient.clipPath = getClipPath();
		// 	// 	break;
		// 	case 'conic':
		// 		gradient.backgroundImage = getConicGradient();
		// 		gradient.clipPath = getClipPath();
		// 		// bg.backgroundImage = getConicGradient();
		// 		break;
		// }

		// const opacity = Math.random() + 0.5;
		// bg.opacity = opacity;
		bg.backgroundImage = `url(/images/bgs/${bgs[Math.floor(Math.random() * bgs.length)]})`;

		const secs = Math.floor(Math.random() * 10) + 5;
		bg.animation = `hue-rotation ${secs}s infinite ease-in-out`

		// setRandoGradient(gradient);
		setRandoBg(bg);
	}

	useEffect(() => {
		getRandoGradient();
	}, [])

	return (
		<div className="relative -z-1">
			<div className="fixed h-screen w-full" style={randoBg}>
				{/* <div className={`overflow-hidden h-screen w-full fixed`}>
					{randoBg !== '' && 
						<Image src={randoBg} alt='random background image' width={2000} height={1500} key={getRandoInt()} style={{height:'100vh', width:'100%', minWidth:'1000px'}} className="hidden md:block"/>
					} 
				</div> */}
			</div>
		</div>
	);
}
