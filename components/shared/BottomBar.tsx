import { sidebarLinks } from "@/constants"
// import { usePathname } from "next/navigation"
import { currentUser } from '@/app/actions/currentUser';
import Link from "next/link"
import Nav from "./Nav";

export default async function BottomBar() {
	// const pathname = usePathname()
	const user = await currentUser()

	const userId = user?.id

	return (
		<section className="bottombar">
			<div className="bottombar_container">
				<Nav/>
			</div>
		</section>
	)
}
