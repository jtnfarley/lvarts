import {currentUser} from "@/app/data/currentUser";
import { Metadata } from "next";
import TopBar from "@/components/layout/TopBar";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import BottomBar from "@/components/layout/BottomBar";
import Initializer from "@/components/Initializer";
import { getUserFollowsDAL, getUserLikesDAL } from "@/app/data/user";

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
	const userFollows = user.userdetails
		? await getUserFollowsDAL(user.userdetails.id)
		: { followers: [], following: [] };
	const userLikes = user.userdetails
		? await getUserLikesDAL(user.userdetails.id)
		: [];

	return (
		<div className="bg-[#030030]">
			<Initializer followers={userFollows.followers} following={userFollows.following} likes={userLikes}/>
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
