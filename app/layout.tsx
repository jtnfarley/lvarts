import { Metadata } from "next";
import { GoogleAnalytics } from '@next/third-parties/google'

import SessionWrapper from "../components/auth/SessionWrapper";

import './globals.css'
import RandoBgs from "@/components/layout/RandoBgs";

export const metadata: Metadata = {
  title: "Lehigh Valley Arts & Music",
  description: "Lehigh Valley Arts Community Social Media",
};

export default async function RootLayout({
  	children,
}: Readonly<{
  	children: React.ReactNode;
}>) {

	return (
		<SessionWrapper>
			<html lang="en">
				<head>
					<GoogleAnalytics gaId="G-J6PQBNCBKC" />
				</head>
				<body>
					<RandoBgs/>
					
					<main className='lg:flex lg:justify-center'>
						<div className="lg:w-[1300px]">
							{children}
						</div>
					</main>
				</body>
			</html>
		</SessionWrapper>
	);
}
