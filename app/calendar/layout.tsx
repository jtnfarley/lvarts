import { Metadata } from "next";
import {isLoggedIn} from "@/app/data/currentUser";
import TopBar from "@/components/layout/TopBar";
import LeftSidebar from "@/components/layout/LeftSidebar";
import BottomBar from "@/components/layout/BottomBar";
import UserDetails from "@/lib/models/userDetails";
import Nav from "@/components/layout/Nav";

export const metadata: Metadata = {
  title: "Lehigh Valley Arts & Music Events Calendar",
  description: "Art & Music Events in the Lehigh Valley",
};

export default async function RootLayout({
  	children,
}: Readonly<{
  	children: React.ReactNode;
}>) {
	let user = await isLoggedIn();

	if (!user) {
		user = {
			userdetails:{} as UserDetails,
			anonymous: true,
			id: 0,
			createdat: new Date(),
			updatedat: new Date()
		}
	}
	return (
		<div className="bg-gray-800">
			<TopBar/>
			<main className="flex flex-row">
				<LeftSidebar currentUser={user}/>
				<section className="calendar-container">
					{
						user && 
						<section className="hidden pt-3 pe-3 xl:flex w-full justify-end">
							<Nav user={user}/>
						</section>
					}
					<div className="flex flex-col w-full min-h-screen">
						{children}
					</div>
				</section>
			</main>
			<BottomBar/>
		</div>	
	);
}
