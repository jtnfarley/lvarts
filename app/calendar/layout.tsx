import { Metadata } from "next";
import {isLoggedIn} from "@/app/data/currentUser";
import TopBar from "@/components/layout/TopBar";
import BottomBar from "@/components/layout/BottomBar";
import UserDetails from "@/lib/models/userDetails";

export const metadata: Metadata = {
  title: "Lehigh Valley Arts & Music Events Calendar",
  description: "Art & Music Events in the Lehigh Valley",
};

export default async function CalendarLayout({
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
	const gradientAngle = Math.floor(Math.random() * 360);

	return (
		<div
			className="min-h-screen lvartsmusic-bg-gradient text-lvartsmusic-foreground"
			style={{ '--gradient-angle': `${gradientAngle}deg` } as React.CSSProperties}
		>
			<TopBar theme="lvartsmusic" user={user}/>
			<main>
				<section className="calendar-container">
					<div className="flex flex-col w-full max-w-[1000px] mx-auto min-h-screen">
						{children}
					</div>
				</section>
			</main>
			<BottomBar theme="lvartsmusic"/>
		</div>
	);
}
