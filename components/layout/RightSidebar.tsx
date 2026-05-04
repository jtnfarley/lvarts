import RecUsers from '../RecUsers';
import {currentUser} from "@/app/data/currentUser";
import Nav from "@/components/layout/Nav";

export default async function RightSidebar() {
	const user = await currentUser();

	return (
		<section className="rightsidebar">
			<div className='my-4'>
				<Nav user={user}/>
			</div>
			<RecUsers/>			
		</section>
	)
}
