'use client'

import PostForm from "./PostForm";
import User from "@/lib/models/user";

interface Props {
    user: User
    posttype: string
    edited: boolean
    savePost:Function
    parentPostId?:number
}

const AddPostForm = ({user, posttype, edited, parentPostId, savePost}: Props) => {
    const postData = {
        posttype,
        parentPostId
    }

    return (
        <div className="lvartsmusic-card p-3 mb-10">
            <PostForm user={user} posttype={posttype} post={postData} edited={edited} savePost={savePost} allowTypeSwitch={posttype !== 'comment'}/>
        </div>
    )
}

export default AddPostForm
