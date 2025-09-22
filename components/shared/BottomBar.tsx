import { sidebarLinks } from "@/constants"
// import { usePathname } from "next/navigation"
import { auth } from '@/auth';
import Link from "next/link"
import Image from "next/image"

export default async function BottomBar() {
	// const pathname = usePathname()
	const session = await auth()

	const userId = session?.user?.id

	return (
		<section className="bottombar">
			<div className="bottombar_container">
				{
					sidebarLinks.map((link) => {
						// const isActive = (pathname.includes(link.route) && link.route.length > 1) || pathname === link.route

						// if (link.route === "/profile") {
						// 	link.route = `${link.route}/${userId}`
						// }

						return (
							<Link href={link.route} key={link.label} 
							className={`bottombar_link bg-primary-500`}>
								<Image src={link.imgURL} alt={link.label} width={24} height={24} />
								<p className="text-light-1">{link.label}</p>
							</Link>
						)
					})
				}
			</div>
		</section>
	)
}
