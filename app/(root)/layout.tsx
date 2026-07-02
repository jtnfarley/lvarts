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

// Applies the persisted theme before paint to avoid a light/dark flash.
// Runs synchronously as the first child of the theme wrapper, so
// `document.currentScript.parentElement` always resolves to that wrapper.
const themeInitScript = `(function(){try{var t=localStorage.getItem('lvartsmusic-theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.currentScript.parentElement.classList.add('dark');}catch(e){}})();`;

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
		<div data-theme="lvartsmusic" suppressHydrationWarning className={`${geistSans.variable} font-lvartsmusic-sans bg-lvartsmusic-background text-lvartsmusic-foreground`}>
			<script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
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
