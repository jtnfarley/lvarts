import SignOut from '@/components/auth/buttons/SignOut';
import Nav from "./Nav";
import {isLoggedIn} from "@/app/data/currentUser";

export default async function BottomBar() {
	const user = await isLoggedIn();

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
