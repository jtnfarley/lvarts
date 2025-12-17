import { Inter } from "next/font/google";
import { Metadata } from "next";
import { cookies } from 'next/headers'
import { currentUser } from '@/app/actions/currentUser';
import TopBar from "@/components/shared/TopBar";
import LeftSidebar from "@/components/shared/LeftSidebar";
import RightSidebar from "@/components/shared/RightSidebar";
import BottomBar from "@/components/shared/BottomBar";
import User from "@/lib/models/user";
// import { UserStoreProvider } from "./stores/userStoreProvider";

export const metadata: Metadata = {
  title: "Lehigh Valley Arts & Music",
  description: "Lehigh Valley Arts Community Social Media",
};

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  	children,
}: Readonly<{
  	children: React.ReactNode;
}>) {
	const user = await currentUser() as User

	return (
		<>
			<TopBar/>
			<main className="flex flex-row">
				<LeftSidebar/>
				<section className="main-container">
					<div className="flex flex-col w-full md:w-lg min-h-screen">
						{children}
					</div>
				</section>
				<RightSidebar/>
			</main>
			<BottomBar/>
		</>	
	);
}
