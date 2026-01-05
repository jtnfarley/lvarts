import { Metadata } from "next";
import { GoogleAnalytics } from '@next/third-parties/google'

import SessionWrapper from "../components/auth/SessionWrapper";

import './globals.css'
import Image from "next/image";

export const metadata: Metadata = {
  title: "Lehigh Valley Arts & Music",
  description: "Lehigh Valley Arts Community Social Media",
};

export default async function RootLayout({
  	children,
}: Readonly<{
  	children: React.ReactNode;
}>) {

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

	const getRandoImage = ():string => {
		const randoIndex = Math.floor(Math.random() * bgs.length);
		const randoVersion = Math.floor(Math.random() * 100000);
		return `/images/bgs/${bgs[randoIndex]}`;
	}

	const getRandoInt = ():number => {
		return Math.floor(Math.random() * 100000);
	}

	return (
		<SessionWrapper>
			<html lang="en">
				<head>
					<GoogleAnalytics gaId="G-J6PQBNCBKC" />
				</head>
				<body>
					<div className="relative"><Image src={getRandoImage()} alt='random background image' width={2000} height={1500} key={getRandoInt()} style={{height:'100vh', position:'fixed', width:'100vw', zIndex:-1}}/></div>
					
					<main className='lg:flex lg:justify-center'>
						<div className="lg:max-w-1300">
							{children}
						</div>
					</main>
				</body>
			</html>
		</SessionWrapper>
	);
}
