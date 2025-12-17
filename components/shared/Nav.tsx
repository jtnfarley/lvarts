import { sidebarLinks } from "@/constants"
import Link from "next/link"

export default async function Nav() {

	return (		
		<div className='flex lg:flex-col lg:pe-10 gap-8 items-end'>
			{
				sidebarLinks.map((link) => {
					return (
						<Link href={link.route} key={link.label} 
						className={`leftsidebar_link flex flex-row items-center`}>
							{link.icon}
							{/* <Image src={link.imgURL} alt={link.label} width={24} height={24} /> */}
							<p className="hidden text-gray-500 text-lg lg:block ms-4">{link.label}</p>
						</Link>
					)
				})
			}
			
		</div>
	)
}
