import {currentUser} from "@/app/data/currentUser";
import { Metadata } from "next";
import { Geist } from "next/font/google";
import TopBar from "@/components/layout/TopBar";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import BottomBar from "@/components/layout/BottomBar";
import Initializer from "@/components/Initializer";
import { getUserFollowsDAL, getUserLikesDAL } from "@/app/data/user";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

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
		<div
			className={`${geistSans.variable} font-lvartsmusic-sans lvartsmusic-bg-gradient text-lvartsmusic-foreground`}
		>
			<Initializer followers={userFollows.followers} following={userFollows.following} likes={userLikes}/>
			<TopBar theme="lvartsmusic" user={user}/>
			<main className="mx-auto flex w-full max-w-[1265px] justify-center">
				<LeftSidebar currentUser={user} theme="lvartsmusic"/>
				<section className="main-container">
					<div className="flex flex-col min-h-screen w-full ">
						{children}
					</div>
				</section>
				<RightSidebar/>
			</main>
			<BottomBar theme="lvartsmusic"/>
		</div>
	);
}
