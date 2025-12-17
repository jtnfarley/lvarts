import { sidebarLinks } from "@/constants"
import Link from "next/link"

import SignOut from '@/components/auth/buttons/SignOut';

export default async function Nav() {

	return (		
		<div className='flex lg:flex-col ps-5 gap-8'>
			{
				sidebarLinks.map((link) => {
					// const isActive = (pathname.includes(link.route) && link.route.length > 1) || pathname === link.route

					// if (link.route === "/profile") {
					// 	link.route = `${link.route}/${userId}`
					// }

					return (
						<Link href={link.route} key={link.label} 
						className={`leftsidebar_link flex flex-row items-center`}>
							{link.icon}
							{/* <Image src={link.imgURL} alt={link.label} width={24} height={24} /> */}
							<p className="hidden text-primary-dark text-lg lg:block ms-4">{link.label}</p>
						</Link>
					)
				})
			}
			<SignOut/>
		</div>
	)
}
