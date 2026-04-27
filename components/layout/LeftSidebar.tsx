import Link from "next/link"
import Image from "next/image"

import SignOut from '@/components/auth/buttons/SignOut';
import {isLoggedIn} from "@/app/data/currentUser";
import imageUrl from '@/constants/imageUrl';

export default async function LeftSidebar() {
	const user = await isLoggedIn();

	return (
		<section className="leftsidebar custom-scrollbar p-4">
			<div className="flex w-full flex-1 flex-col">
				<a href='/home' className="flex items-center">
                    <Image
                        src='/logos/lvarts-paths.svg'
                        alt="Lehigh Valley Arts & Music"
                        width={500}
                        height={195}
                        className='w-full'
						priority
                    />
                </a>
				<div className="border border-orange flex flex-col h-full p-10 mt-4">
					{user && user.userDetails && user.userDetails.avatar ?
						<div className='h-45 flex justify-center'>
							<Image
								src={`${imageUrl}/${user.userDetails.userDir}/${user.userDetails.avatar}`}
								alt={user.userDetails?.displayName || 'Lehigh Valley Art & Music'}
								width={300}
								height={300}
								className='avatar-profile'
							/>
						</div>
						:
						<div className='h-45 flex justify-center'>
							<Image
								src={`/images/melty-man.png`}
								alt={'Lehigh Valley Art & Music'}
								width={300}
								height={300}
								className='avatar-profile'
							/>
						</div>
					}
					{user && user.userDetails && 
						<div>
							<div className="flex justify-center uppercase text-xl font-bold mb-10">{user.userDetails.displayName}</div>
							<div className="flex mb-10">
								<div className="w-1/2 flex flex-col items-center justify-center border-e-2">
									<div className="text-2xl"><strong>{user.userDetails.followers.length || 0}</strong></div>
									<div className="uppercase text-sm">followers</div>
								</div>
								<div className="w-1/2 flex flex-col items-center justify-center">
									<div className="text-2xl"><strong>{user.userDetails.following.length || 0}</strong></div>
									<div className="uppercase text-sm">following</div>
								</div>
							</div>
						</div>
					}
					<div className='flex flex-col items-center h-full justify-end'>
						{user &&
							<div>
								<SignOut/>
								<div className='mt-3 text-md text-gray-400'><Link href='/code-of-conduct' className='code-link'>Code of Conduct</Link></div>
							</div>
						}
					</div>
				</div>
			</div>
		</section>
	)
}
