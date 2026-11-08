'use server'

import { isLoggedIn } from "../data/currentUser"
import { likePostDAL, unlikePostDAL } from "@/lib/posts/likes"

// The acting user is always the logged-in one; the browser does not get to say who is liking.
const requireUserdetailsId = async (): Promise<number> => {
    const user = await isLoggedIn()
    const userdetailsid = user?.userdetails?.id
    if (!userdetailsid) throw new Error('Not signed in')
    return userdetailsid
}

export const likePost = async (postid:number) => {
    if (!Number.isInteger(postid)) return;
    await likePostDAL(postid, await requireUserdetailsId());
}

export const unlikePost = async (postid:number) => {
    if (!Number.isInteger(postid)) return;
    await unlikePostDAL(postid, await requireUserdetailsId());
}
