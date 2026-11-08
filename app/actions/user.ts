'use server'

import { followUserDAL, unfollowUserDAL, getUserDAL, getUserDetailsDAL } from "../data/user"
import { isLoggedIn } from "../data/currentUser"

// The follower is always the logged-in user; the browser does not get to say who is following.
const requireUserdetailsId = async (): Promise<number> => {
    const user = await isLoggedIn()
    const userdetailsid = user?.userdetails?.id
    if (!userdetailsid) throw new Error('Not signed in')
    return userdetailsid
}

export const followUser = async ({followinguserdetailsid}:{followinguserdetailsid: number}) => {
    return followUserDAL({userdetailsid: await requireUserdetailsId(), followinguserdetailsid});
}

export const unfollowUser = async ({followinguserdetailsid}:{followinguserdetailsid: number}) => {
    return unfollowUserDAL({userdetailsid: await requireUserdetailsId(), followinguserdetailsid});
}

export const getUser = async (handle:string) => {
    return await getUserDAL(handle);
}

export const getUserDetails = async (userid:number) => {
    return await getUserDetailsDAL(userid);
}
