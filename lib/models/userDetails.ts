export default interface UserDetails {
    id: string
    userId: string
	bio?: string | null
	chats: string[]
	comments: string[]
	createdAt: Date
	displayName: string
	followers: string[]
	following: string[]
	image?: string | null
	likedPosts: string[]
	postIds: string[]
	suspended?: boolean | null
	updatedAt: Date
}
