export default interface UserDetails {
    id: string
    userId: string
	bio?: string | null
	chats: string[]
	comments: string[]
	createdAt: Date
	displayName?: string | null
	userDir?: string | null
	followers: string[]
	following: string[]
	avatar?: string | null
	likedPosts: string[]
	postIds: string[]
	suspended?: boolean | null
	updatedAt: Date
}
