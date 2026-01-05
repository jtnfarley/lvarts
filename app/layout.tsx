import { Metadata } from "next";
import { GoogleAnalytics } from '@next/third-parties/google'

import SessionWrapper from "../components/auth/SessionWrapper";

import './globals.css'

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
	]

	const getRandoImage = () => {
		const randoIndex = Math.floor(Math.random() * bgs.length);
		return `/images/bgs/${bgs[randoIndex]}`;
	}

	return (
		<SessionWrapper>
			<html lang="en">
				<head>
					<GoogleAnalytics gaId="G-J6PQBNCBKC" />
				</head>
				<body>
					<div className="relative"><div style={{background:`url(${getRandoImage()}) no-repeat`, backgroundSize: 'cover', height:'100vh', position:'fixed', width:'100vw', zIndex:-1}}></div></div>
					
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
