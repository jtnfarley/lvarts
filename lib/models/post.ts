import UserDetails from "./userDetails"
import User from "./user"
import Venue from "./venue"

export default interface Post {
    id: string
	content: string
	lexical?: string | null
	headline?: string | null
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
	eventTitle?: string | null
	eventDate?: Date | null
	town?: string | null
	neighborhood?: string | null
	venueName?: string | null
	venueId?: string | null
	venue?: Venue | null
	address?: string | null
	tags?: string | null
	seeking?: string | null
	status?: string | null
}
