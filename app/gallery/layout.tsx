import { Metadata } from "next";
import {isLoggedIn} from "@/app/data/currentUser";
import TopBar from "@/components/layout/TopBar";
import BottomBar from "@/components/layout/BottomBar";
import UserDetails from "@/lib/models/userDetails";

export const metadata: Metadata = {
  title: "Lehigh Valley Arts & Music",
  description: "Lehigh Valley Arts Community Social Media",
};

export default async function GalleryLayout({
  	children,
}: Readonly<{
  	children: React.ReactNode;
}>) {
	let user = await isLoggedIn();

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
