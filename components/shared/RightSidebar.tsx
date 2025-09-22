import { fetchUsers } from "@/lib/data/user.data"
import { auth } from '@/auth';
import UserCard from "../cards/UserCard"

export default async function RightSidebar() {
	const session = await auth()
	const user = session?.user

	if (!user) return null

	const similarMinds = {
		users:[]
	}
	// await fetchUsers({
	// 	userId: user.id,
	// 	pageSize: 4
	// })

	return (
		<section className="custom-scrollbar rightsidebar">
			<div className="flex flex-1 flex-col justify-start">
				<h3 className="text-lg font-semibold text-light-1">Suggestions</h3>
			</div>

			<div className="flex flex-col flex-1 justify-start">
				<h3 className="text-lg font-semibold text-light-1">Groups</h3>
			</div>

			<div className="flex flex-col flex-1 justify-start">
				<h3 className="text-lg font-semibold text-light-1">Users</h3>
				<div className="mt-7 flex w-[350] flex-col gap-10">
					{
						similarMinds.users.length > 0 ? (
							<>
								{
									similarMinds.users.map((user: any) => (
										<UserCard
											key={ user.id }
											id={ user.id }
											name={ user.name }
											username={ user.username }
											imgUrl={ user.imageUrl }
											// userType = 'User'
										/>
									))
								}
							
							</>
						) : (
							<p className="!text-base-regular text-light-3">No users yet</p>
						)
					}
				</div>
			</div>
			
		</section>
	)
}
