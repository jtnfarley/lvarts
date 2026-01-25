import RecUsers from '../RecUsers';
import { auth } from '@/auth';
import User from '@/lib/models/user';

export default async function RightSidebar() {
	const session = await auth();
	let user;

	if (!session?.user || !session?.user?.id) {
		return null;
	} else {
		user = session.user as User;
	}

	return (
		<section className="custom-scrollbar rightsidebar">
			<RecUsers/>			
		</section>
	)
}
