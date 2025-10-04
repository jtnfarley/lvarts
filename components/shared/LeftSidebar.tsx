import { sidebarLinks } from "@/constants"
// import { usePathname } from "next/navigation"
import { currentUser } from '@/app/actions/currentUser';
import Link from "next/link"
import Image from "next/image"

import SignOut from '@/components/auth/buttons/SignOut';

export default async function LeftSidebar() {
	// const pathname = usePathname()
	const user = await currentUser()

	const userId = user?.id

	return (
		<section className="leftsidebar custom-scrollbar">
			<div className="flex w-full flex-1 flex-col gap-6 px-6">
				{
					sidebarLinks.map((link) => {
						// const isActive = (pathname.includes(link.route) && link.route.length > 1) || pathname === link.route

						// if (link.route === "/profile") {
						// 	link.route = `${link.route}/${userId}`
						// }

						return (
							<Link href={link.route} key={link.label} 
							className={`leftsidebar_link bg-primary-500`}>
								<Image src={link.imgURL} alt={link.label} width={24} height={24} />
								<p className="text-light-1">{link.label}</p>
							</Link>
						)
					})
				}
				<SignOut/>
			</div>
		</section>
	)
}
