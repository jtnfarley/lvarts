import Post from "./post"
import User from "./user"
import UserDetails from "./userDetails"

export default interface Notification {
    id: string
    createdAt: Date
    type: string
    read: boolean
    userId: string 
    user?: User
    notiUserId?: string 
    notiUser?: User
    notiUserDetailsId?: string | null
    notiUserDetails?: UserDetails | null
    postId?: string | null
    post?: Post | null
}
