import UserDetails from "./userDetails"
import User from "./user"

export default interface Post {
    id: string
	content: string
	lexical?: string | null
    userId: string 
	userDetailsId?: string
	userDetails?: UserDetails | null
	user?: User
	createdAt: Date
    updatedAt: Date
    edited: boolean
	parentPostId?: string
	parentPost?: Post | null
	postFile?: string
	postType?: string
	privatePost?: boolean
	tempFile?: string
	userDir?: string
    chatId?: string
	likes?: number
	commentCount?: number
}
