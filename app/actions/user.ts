'use server'

import { followUserDAL, unfollowUserDAL, getUserDAL, getUserDetailsDAL } from "../data/user"

interface FollowUserParams {
    userdetailsid: number,
    followinguserdetailsid: number
}

export const followUser = async ({userdetailsid, followinguserdetailsid}:FollowUserParams) => {
    await followUserDAL({userdetailsid, followinguserdetailsid});
}

export const unfollowUser = async ({userdetailsid, followinguserdetailsid}:FollowUserParams) => {
    await unfollowUserDAL({userdetailsid, followinguserdetailsid});
}

export const getUser = async (handle:string) => {
    return await getUserDAL(handle);
}

export const getUserDetails = async (userid:number) => {
    return await getUserDetailsDAL(userid);
}
