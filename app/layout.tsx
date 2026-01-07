import { Metadata } from "next";
import { GoogleAnalytics } from '@next/third-parties/google'

import SessionWrapper from "../components/auth/SessionWrapper";

import './globals.css'
import RandoBgs from "@/components/layout/RandoBgs";
import { ModalProvider } from '@/app/contextProviders/modalProvider'
import { ModalRoot } from '@/components/Modal/ModalRoot'

export const metadata: Metadata = {
  title: "Lehigh Valley Art & Music",
  description: "Lehigh Valley Arts Community Social Media",
};

export default async function RootLayout({
  	children,
}: Readonly<{
  	children: React.ReactNode;
}>) {

	return (
		<SessionWrapper>
			<ModalProvider>
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
						<ModalRoot/>
					</body>
				</html>
			</ModalProvider>
		</SessionWrapper>
	);
}
