export default interface SidebarProfile {
    id: number
    userid: number
    handle?: string | null
    displayname?: string | null
    avatar?: string | null
    userdir?: string | null
    followers: string[]
    following: string[]
    biohtml?: string | null
    biolexical?: string | null
    postcount: number
    followerscount: number
    followingcount: number
    urls: {
        id?: number
        urlname: string
        url: string
    }[]
}
