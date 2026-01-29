'use client'

import { savePost } from "@/app/actions/posts";
import PostForm from "./PostForm";
import User from "@/lib/models/user";
import Post from "@/lib/models/post";

interface Props {
    user: User
    postType: string
    edited: boolean
    parentPostId?:string
}

const AddPostForm = ({user, postType, edited, parentPostId}: Props) => {

    const postData = {
        postType,
        parentPostId
    } as Post

    return (
        <PostForm user={user} post={postData} edited={edited} savePost={savePost}/>
    )
}

export default AddPostForm