'use client'

import PostForm from "./PostForm";
import User from "@/lib/models/user";
import Post from "@/lib/models/post";

interface Props {
    user: User
    postType: string
    edited: boolean
    savePost:Function
    parentPostId?:string
}

const AddPostForm = ({user, postType, edited, parentPostId, savePost}: Props) => {
    const postData = {
        postType,
        parentPostId
    } as Post

    return (
        <PostForm user={user} postType={postType} post={postData} edited={edited} savePost={savePost}/>
    )
}

export default AddPostForm