export default interface Notification {
    notiid?: number
    id: number
    createdat: Date
    notificationtypeid: number
    read: boolean
    notificationtype?: string
    senderuserdetailsid?: number
    postid?: number | null
    displayname?: string | null
    userdir?: string | null
    avatar?: string | null
    handle?: string | null
    biohtml?: string | null
}
