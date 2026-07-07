export interface FeedRow {
    id: number
    content: string | null
    lexical: string | null
    createdat: Date
    updatedat: Date
    edited: boolean | null
    posttype: string
    posttypes: {
        posttype: string
    }
    privatepost: boolean | null
    isboosted: boolean
    parentPostId: number | null
    userdetails: {
        id: number
        userid: number
        displayname: string | null
        userdir: string | null
        avatar: string | null
        handle: string | null
        biohtml: string | null
        biolexical: string | null
    }
    eventid: number | null
    eventname: string | null
    eventdate: Date | null
    venueid: number | null
    venuename: string | null
    address: string | null
    city: string | null
    state: string | null
    zipcode: string | null
    filetype: string | null
    filetypes: {
        filetype: string | null
    }
    postfile: string | null
    likes: number | null
    parentPost?: {
        postid: number
        userid: number
        displayName: string | null
    } | null
    comments: number | null
    audio: {
        id: number | null
        trackname: string | null
        artist: string | null
        album: string | null
        coverartfile: string | null
        releaseyear: number | null
    }
}
