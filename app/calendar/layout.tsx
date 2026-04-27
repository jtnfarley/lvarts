import { Inter } from "next/font/google";
import { Metadata } from "next";
import {currentUser} from "@/app/data/currentUser";
import TopBar from "@/components/layout/TopBar";
import LeftSidebar from "@/components/layout/LeftSidebar";
import BottomBar from "@/components/layout/BottomBar";

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
	const user = await currentUser();

	return (
		<div>
			<TopBar/>
			<main className="flex flex-row">
				<LeftSidebar currentUser={user}/>
				<section className="calendar-container">
					<div className="flex flex-col w-full min-h-screen">
						{children}
					</div>
				</section>
			</main>
			<BottomBar/>
		</div>	
	);
}
