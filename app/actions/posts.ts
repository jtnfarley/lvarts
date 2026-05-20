'use server'

import { likePostDAL, unlikePostDAL } from "../data/posts"

export const likePost = async (postid:number, userdetailsid:number) => {
    await likePostDAL(postid, userdetailsid);
}

export const unlikePost = async (postid:number, userdetailsid:number) => {
    await unlikePostDAL(postid, userdetailsid);
}