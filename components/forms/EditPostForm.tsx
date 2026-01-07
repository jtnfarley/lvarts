'use client'

import { editPost } from "@/app/actions/posts";
import PostForm from "./PostForm";
import { InitialEditorStateType } from "lexical";
import User from "@/lib/models/user";
import { useModal } from '@/app/contextProviders/modalProvider';
import Post from "@/lib/models/post";

interface Props {
    content:InitialEditorStateType,
    postId:string,
    user:User
}

const EditPostForm = ({content, postId, user}: Props) => {
    const { triggerAction } = useModal();

    const editThisPost = (post:Post) => {
        editPost(post);
        triggerAction();
    }

    return (
        <PostForm content={content} postId={postId} savePost={editThisPost} user={user} postType={''} edited={true} parentPostId={''} />
    )
}

export default EditPostForm