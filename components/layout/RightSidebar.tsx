import RecUsers from '../RecUsers';
import {currentUser} from "@/app/data/currentUser";
import Nav from "@/components/layout/Nav";

export default async function RightSidebar() {
	const user = await currentUser();

	return (
		<div>
			<section className="rightsidebar bg-[#0c0a18]/50 backdrop-blur-sm">
				<div className='my-4'>
					<Nav user={user}/>
				</div>
				<RecUsers/>			
			</section>
			
		</div>
	)
}
