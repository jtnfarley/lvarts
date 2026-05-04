import {currentUser} from "@/app/data/currentUser";
import { Metadata } from "next";
import TopBar from "@/components/layout/TopBar";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import BottomBar from "@/components/layout/BottomBar";

export const metadata: Metadata = {
  title: "Lehigh Valley Arts & Music",
  description: "Lehigh Valley Arts Community Social Media",
};

export default async function RootLayout({
  	children,
}: Readonly<{
  	children: React.ReactNode;
}>) {

	const user = await currentUser();

	return (
		<div className="bg-gray-800/80 backdrop-blur-sm ">
			<TopBar/>
			<main className="flex flex-row justify-between">
				<LeftSidebar currentUser={user}/>
				<section className="main-container">
					<div className="flex flex-col min-h-screen w-full ">
						{children}
					</div>
				</section>
				<RightSidebar/>
			</main>
			<BottomBar/>
		</div>	
	);
}
