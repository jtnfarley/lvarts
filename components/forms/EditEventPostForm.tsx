'use client'

import PostForm from "./PostForm";
import User from "@/lib/models/user";
import { FeedRow } from "@/lib/models/initFeedRow";

interface Props {
    post: Partial<FeedRow>
    user: User
    savePost: Function
}

const EditEventPostForm = ({post, user, savePost}: Props) => {
    return (
        <div className="bg-[#fcf9ef] rounded-lg p-5">
            <div className="mb-4 text-xl font-semibold">Edit Event</div>
            <PostForm post={post} user={user} edited={true} savePost={savePost}/>
        </div>
    )
}

export default EditEventPostForm
