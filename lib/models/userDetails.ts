export default interface UserDetails {
    id: string
    userId: string
	bio: string
	chats: string[]
	comments: string[]
	createdAt: Date
	displayName: string
	followers: string[]
	following: string[]
	image: string
	likedPosts: string[]
	postIds: string[]
	suspended: Boolean
	updatedAt: Date
}