'use client'

import { editPost } from "@/app/actions/posts";
import PostForm from "./PostForm";
import { InitialEditorStateType } from "lexical";
import User from "@/lib/models/user";

interface Props {
    content:InitialEditorStateType,
    postId:string,
    user:User
}

const EditPostForm = ({content, postId, user}: Props) => {

    return (
        <PostForm content={content} postId={postId} savePost={editPost} user={user} postType={''} edited={true} parentPostId={''} />
    )
}

export default EditPostForm