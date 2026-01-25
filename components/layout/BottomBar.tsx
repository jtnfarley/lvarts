import SignOut from '@/components/auth/buttons/SignOut';
import Nav from "./Nav";
import { auth } from '@/auth';
import User from '@/lib/models/user';

export default async function BottomBar() {
	const session = await auth();
	let user;

	if (session?.user && session?.user?.id) {
		user = session.user as User;
	}

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
