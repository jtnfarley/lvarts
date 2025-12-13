'use client'

import { savePost } from "@/app/actions/posts";
import PostForm from "./PostForm";
import User from "@/lib/models/user";

interface Props {
    user: User,
    postType: string,
    edited: boolean,
    parentPostId?:string
}

const AddPostForm = ({user, postType, edited, parentPostId}: Props) => {

    return (
        <PostForm user={user} postType={postType} edited={edited} parentPostId={parentPostId} savePost={savePost}/>
    )
}

export default AddPostForm