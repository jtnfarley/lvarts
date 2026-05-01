export default interface SidebarProfile {
    userId: string
    handle?: string | null
    displayName?: string | null
    avatar?: string | null
    userDir?: string | null
    followers: string[]
    following: string[]
    bio?: string | null
    postCount: number
    urls: string[]
}
