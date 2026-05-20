'use client'

import PostForm from "./PostForm";
import User from "@/lib/models/user";
import { FeedRow } from "@/lib/models/initFeedRow";

interface Props {
    post:FeedRow
    user: User
    savePost: Function
}

const EditPostForm = ({post, user, savePost}: Props) => {
    const editThisPost = async (postData:FeedRow) => {
        await savePost(postData);
    }

    return (
        <PostForm user={user} post={post} edited={true} savePost={editThisPost}/>
    )
}

export default EditPostForm
