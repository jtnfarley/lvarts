import { Metadata } from "next";
import {isLoggedIn} from "@/app/data/currentUser";
import TopBar from "@/components/layout/TopBar";
import BottomBar from "@/components/layout/BottomBar";
import Initializer from "@/components/Initializer";
import { getUserFollowsDAL, getUserLikesDAL } from "@/app/data/user";
import UserDetails from "@/lib/models/userDetails";

export const metadata: Metadata = {
  title: "LVAM Literary Zine - Lehigh Valley Arts & Music",
  description: "Short writing from the Lehigh Valley arts community.",
};

export default async function ZineLayout({
  	children,
}: Readonly<{
  	children: React.ReactNode;
}>) {
	let user = await isLoggedIn();

	// Fills the like and follow stores that the like buttons read, as the main app layout does.
	const userdetailsid = user?.userdetails?.id;
	const userFollows = userdetailsid ? await getUserFollowsDAL(userdetailsid) : { followers: [], following: [] };
	const userLikes = userdetailsid ? await getUserLikesDAL(userdetailsid) : [];

	user ??= {
		userdetails:{} as UserDetails,
		anonymous: true,
		id: 0,
		createdat: new Date(),
		updatedat: new Date()
	};

	return (
		<div
			className="min-h-screen lvartsmusic-bg-gradient text-lvartsmusic-foreground"
		>
			<Initializer followers={userFollows.followers} following={userFollows.following} likes={userLikes}/>
			<TopBar theme="lvartsmusic" user={user}/>
			<main>
				<section className="calendar-container">
					<div className="flex flex-col w-full min-h-screen">
						{children}
					</div>
				</section>
			</main>
			<BottomBar theme="lvartsmusic"/>
		</div>
	);
}
