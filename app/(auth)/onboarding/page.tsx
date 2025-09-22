import AccountInfo from "@/components/forms/AccountInfo"
import { fetchUser } from "@/lib/data/user.data"
import { UserProfile } from "@clerk/nextjs"
import { currentUser } from "@clerk/nextjs/server"
import { dark } from "@clerk/themes"
import { redirect } from "next/navigation"

export default async function Page() {
	const user = await currentUser()
	if (!user) return null
	
	const userInfo = await fetchUser(user.id)
	if (userInfo?.onboarded) redirect('/')

	const userData = {
		id: user?.id,
		objectID: userInfo?._id,
		username: (userInfo) ? userInfo?.username : user?.username,
		name: (userInfo) ? userInfo?.name : user?.firstName,
		bio: (userInfo) ? userInfo?.bio : '',
		image: (userInfo) ? userInfo?.image : user?.imageUrl,
	}
	
	return (
		<>
			<main className="mx-2 justify-start flex flex-col pc-10 py-20">
				<div className="text-center">
					<h1 className="head-text">Welcome to Twit</h1>
					<p className="mt-3 text-base-regular text-light-2">Complete your profile to use Twit</p>
				</div>

				<div className="mt-10">
					<UserProfile
						appearance={{
							baseTheme: dark,
						}}
						routing='hash'
					/>
				</div>

				<AccountInfo
					user={userData}
				/>
			</main>
		</>
	)
}
