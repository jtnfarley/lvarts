'use client'

import { savePost } from "@/app/actions/posts";
import PostForm from "./PostForm";

interface Props {
    userId: string,
    postType: string,
    edited: boolean,
    parentPostId?:string
}

const AddPostForm = ({userId, postType, edited, parentPostId}: Props) => {

    return (
        <PostForm userId={userId} postType={postType} edited={edited} parentPostId={parentPostId} savePost={savePost}/>
    )
}

export default AddPostForm