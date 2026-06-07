import { Metadata } from "next";
import {isLoggedIn} from "@/app/data/currentUser";
import TopBar from "@/components/layout/TopBar";
import LeftSidebar from "@/components/layout/LeftSidebar";
import BottomBar from "@/components/layout/BottomBar";
import UserDetails from "@/lib/models/userDetails";
import Nav from "@/components/layout/Nav";

export const metadata: Metadata = {
  title: "Lehigh Valley Arts & Music",
  description: "Lehigh Valley Arts Community Social Media",
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
		<div className="bg-[url(/images/frames/marble.png)] bg-cover">
			<TopBar/>
			<main className="flex flex-row">
				<section className="calendar-container">
					{
						user && 
						<section className="hidden pt-3 pe-3 xl:flex w-full justify-end">
							<Nav user={user} shade='dark'/>
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
