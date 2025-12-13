import UserDetails from "./userDetails"
import User from "./user"

export default interface Post {
    id: string
	content: string
	lexical?: string | null
    userId: string 
	userDetailsId?: string | null
	userDetails?: UserDetails | null
	user?: User
	createdAt: Date
    updatedAt: Date
    edited: boolean
	parentPostId?: string | null
	parentPost?: Post | null
	postFile?: string | null
	postFileType?: string | null
	postType?: string | null
	privatePost?: boolean | null
	tempFile?: string | null
	userDir?: string | null
    chatId?: string | null
	likes?: number | null
	commentCount?: number | null
}
