import { currentUser } from '@/app/actions/currentUser';
import RecUsers from '../RecUsers';

export default async function RightSidebar() {
	const user = await currentUser()

	if (!user) return null

	return (
		<section className="custom-scrollbar rightsidebar">
			<RecUsers/>			
		</section>
	)
}
