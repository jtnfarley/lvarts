'use client'

import PostForm from "./PostForm";
import User from "@/lib/models/user";
import Post from "@/lib/models/post";

interface Props {
    user: User
    savePost:Function
}

const AddEventForm = ({user, savePost}: Props) => {
    return (
        <div className="bg-white rounded-lg p-5">
            <div className="mb-4 text-xl font-semibold">Add Event</div>
            <div className="mb-4 text-sm text-gray-600">
                Add the title, time, location, and description so the event can appear in the calendar and scene feeds.
            </div>
            <PostForm user={user} post={{postType:'event'} as Post} edited={false} savePost={savePost}/>
        </div>
    )
}

export default AddEventForm
