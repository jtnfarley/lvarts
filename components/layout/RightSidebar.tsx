import RecUsers from '../RecUsers';
import {currentUser} from "@/app/data/currentUser";

export default async function RightSidebar() {
	const user = await currentUser();

	return (
		<section className="custom-scrollbar rightsidebar">
			<RecUsers/>			
		</section>
	)
}
