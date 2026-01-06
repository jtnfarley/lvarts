import { currentUser } from '@/app/actions/currentUser';
import Link from "next/link"
import Image from "next/image"

import SignOut from '@/components/auth/buttons/SignOut';
import Nav from "./Nav";

export default async function LeftSidebar() {
	// const pathname = usePathname()
	const user = await currentUser()

	const userId = user?.id

	return (
		<section className="leftsidebar custom-scrollbar justify-between">
			<div className="flex w-full flex-1 flex-col">
				<Link
                    href='/home'
                    className="flex items-center"
                >
                    <Image
                        src='/logos/lvarts-paths.svg'
                        alt="Lehigh Valley Arts & Music"
                        width={500}
                        height={195}
                        className='w-70'
						priority
                    />
                </Link>
				<div className='ms-3 uppercase'>beta version 0.1.0</div>
				<div className='mt-4'>
					{user && 
						<Nav user={user}/>
					}
				</div>
			</div>
			<div className='flex flex-col items-end pe-10'>
				{user &&
					<div>
						<SignOut/>
						<div className='mt-3 text-md text-gray-400'><Link href='/code-of-conduct' className='code-link'>Code of Conduct</Link></div>
					</div>
				}
			</div>
		</section>
	)
}
