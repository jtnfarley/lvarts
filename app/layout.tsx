import { Metadata } from "next";

import SessionWrapper from "../components/auth/SessionWrapper";
import User from "@/lib/models/user";

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

	return (
		<SessionWrapper>
			{/* <UserStoreProvider> */}
				<html lang="en">
					<body>
						<main className='lg:flex lg:justify-center'>
							<div className="lg:max-w-1300">
								{children}
							</div>
						</main>
					</body>
				</html>
			{/* </UserStoreProvider> */}
		</SessionWrapper>
	);
}
