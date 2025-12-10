import { currentUser } from '@/app/actions/currentUser';
import Link from "next/link"
import Image from "next/image"

import Nav from "./Nav";

export default async function LeftSidebar() {
	// const pathname = usePathname()
	const user = await currentUser()

	const userId = user?.id

	return (
		<section className="leftsidebar custom-scrollbar">
			<div className="flex w-full flex-1 flex-col gap-6">
				<Link
                    href='/home'
                    className="flex items-center gap-4"
                >
                    <Image
                        src='/logos/lvarts-paths.svg'
                        alt="Lehigh Valley Arts & Music"
                        width={500}
                        height={195}
                        className='w-70'
                    />
                </Link>
				<div className='mt-4'>
					<Nav/>
				</div>
			</div>
		</section>
	)
}
