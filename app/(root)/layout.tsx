import {currentUser} from "@/app/data/currentUser";
import { Metadata } from "next";
import TopBar from "@/components/layout/TopBar";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import BottomBar from "@/components/layout/BottomBar";
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

	const user = await currentUser();

	return (
		<div>
			<TopBar/>
			<main className="flex flex-row">
				<LeftSidebar/>
				<section className="main-container">
					<div className="flex flex-col min-h-screen w-full ">
						<div className='my-4'>
							<Nav user={user}/>
						</div>
						{children}
					</div>
				</section>
				<RightSidebar/>
			</main>
			<BottomBar/>
		</div>	
	);
}
