import RecUsers from '../RecUsers';
import SidebarSearch from "@/components/layout/SidebarSearch";
import TrendingPlaceholder from "@/components/shared/TrendingPlaceholder";

export default async function RightSidebar() {
	return (
		<aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-87.5 shrink-0 flex-col gap-4 overflow-y-auto py-4 pl-6 xl:flex">
			<SidebarSearch />

			<section className="lvartsmusic-card">
				<h2 className="px-4 pt-3 text-xl font-extrabold text-lvartsmusic-foreground">
					Trending in the Valley
				</h2>
				<TrendingPlaceholder />
			</section>

			<section className="lvartsmusic-card">
				<h2 className="px-4 pt-3 text-xl font-extrabold text-lvartsmusic-foreground">
					Who to follow
				</h2>
				<RecUsers />
			</section>

			<p className="px-4 pb-6 text-xs text-lvartsmusic-muted">
				Lehigh Valley Arts &amp; Music
			</p>
		</aside>
	)
}
