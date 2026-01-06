import { currentUser } from '@/app/actions/currentUser';
import SignOut from '@/components/auth/buttons/SignOut';
import Nav from "./Nav";

export default async function BottomBar() {
	// const pathname = usePathname()
	const user = await currentUser()

	const userId = user?.id

	return (
		<section className="bottombar">
			<div className="bottombar_container">
				{user && 
					<>
						<Nav user={user}/>
						<div className='ms-3'><SignOut/></div>
					</>
				}
				
			</div>
		</section>
	)
}
