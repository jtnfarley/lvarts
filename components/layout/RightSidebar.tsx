import Link from "next/link";
import { BiCalendar } from "react-icons/bi";
import RecUsers from '../RecUsers';
import SidebarSearch from "@/components/layout/SidebarSearch";
import UpcomingEvents from "@/components/UpcomingEvents";
import CurrentWeather from "@/components/CurrentWeather";

export default async function RightSidebar() {
	return (
		<aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-87.5 shrink-0 flex-col gap-4 overflow-y-auto pt-4 pb-[130px] pl-6 xl:flex">
			<SidebarSearch />

			<section className="lvartsmusic-card">
				<h2 className="px-4 pt-3 text-xl font-extrabold text-lvartsmusic-foreground">
					Current Weather
				</h2>
				<CurrentWeather />
			</section>

			<section className="lvartsmusic-card">
				<h2 className="px-4 pt-3 text-xl font-extrabold text-lvartsmusic-foreground">
					<Link href="/calendar" className="flex items-center gap-2" title="View the event calendar">
						Upcoming Events
						<BiCalendar className="text-2xl" aria-hidden="true" />
					</Link>
				</h2>
				<UpcomingEvents />
			</section>

			<section className="lvartsmusic-card">
				<h2 className="px-4 pt-3 text-xl font-extrabold text-lvartsmusic-foreground">
					Who to follow
				</h2>
				<RecUsers />
			</section>
		</aside>
	)
}
