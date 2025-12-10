export default interface UserDetails {
    id: string
    userId: string
	bio: string | null
	chats: string[]
	comments: string[]
	createdAt: Date
	displayName: string
	followers: string[]
	following: string[]
	avatar: string | null
	likedPosts: string[]
	postIds: string[]
	suspended: Boolean
	updatedAt: Date
}