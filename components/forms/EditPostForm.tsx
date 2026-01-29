'use client'

import { useState } from "react";
import PostForm from "./PostForm";
import User from "@/lib/models/user";
import Post from "@/lib/models/post";

interface Props {
    post:Post
    user: User
    savePost: Function
}

const EditPostForm = ({post, user, savePost}: Props) => {

    const editThisPost = async (post:Post) => {
        const editedPost = await savePost(post);
        console.log(editedPost)
    }

    return (
        <PostForm user={user} postData={post} edited={true} savePost={editThisPost}/>
    )
}

export default EditPostForm